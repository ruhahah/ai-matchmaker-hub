import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId, mode } = await req.json();
    // mode: "volunteers-for-task" | "tasks-for-volunteer"

    if (!taskId && mode !== "tasks-for-volunteer") {
      return new Response(
        JSON.stringify({ error: "taskId is required for volunteers-for-task mode" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (mode === "tasks-for-volunteer") {
      // Find tasks recommended for a volunteer
      const { volunteerId } = await req.json().catch(() => ({ volunteerId: null }));
      return await matchTasksForVolunteer(supabase, lovableApiKey, taskId || volunteerId);
    }

    // Default: find volunteers for a task
    return await matchVolunteersForTask(supabase, lovableApiKey, taskId);

  } catch (e) {
    console.error("semantic-match error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function matchVolunteersForTask(supabase: any, apiKey: string, taskId: string) {
  // Fetch task
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id, title, description, skills, location, urgency")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    return new Response(
      JSON.stringify({ error: `Task not found: ${taskError?.message}` }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Fetch all volunteers
  const { data: volunteers, error: volError } = await supabase
    .from("profiles")
    .select("id, name, skills, bio")
    .eq("role", "volunteer");

  if (volError || !volunteers || volunteers.length === 0) {
    return new Response(
      JSON.stringify({ matches: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Ask LLM to score matches
  const volunteersDesc = volunteers.map((v: any, i: number) =>
    `[${i}] ${v.name} | Skills: ${v.skills.join(", ")} | Bio: ${v.bio}`
  ).join("\n");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `You are an AI matching engine for a volunteering platform. Score how well each volunteer matches a task based on skills, experience, and bio relevance. Be generous but accurate - most volunteers should have scores between 0.5 and 0.99. Provide a brief, specific explanation referencing the volunteer's actual skills/bio.`,
        },
        {
          role: "user",
          content: `TASK:\nTitle: ${task.title}\nDescription: ${task.description}\nSkills needed: ${task.skills.join(", ")}\nLocation: ${task.location}\nUrgency: ${task.urgency}\n\nVOLUNTEERS:\n${volunteersDesc}\n\nScore each volunteer's match to this task.`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "submit_matches",
            description: "Submit scored volunteer matches for the task",
            parameters: {
              type: "object",
              properties: {
                matches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      index: { type: "integer", description: "Volunteer index from the list" },
                      score: { type: "number", description: "Match score 0.0-1.0" },
                      reason: { type: "string", description: "Brief explanation of why this volunteer matches (1-2 sentences)" },
                    },
                    required: ["index", "score", "reason"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["matches"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "submit_matches" } },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("AI gateway error:", response.status, errText);

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`AI matching failed: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall) {
    throw new Error("AI did not return structured matches");
  }

  const parsed = JSON.parse(toolCall.function.arguments);
  const matches = (parsed.matches || [])
    .map((m: any) => ({
      volunteerId: volunteers[m.index]?.id,
      volunteerName: volunteers[m.index]?.name,
      volunteerSkills: volunteers[m.index]?.skills,
      volunteerBio: volunteers[m.index]?.bio,
      taskId,
      score: Math.min(1, Math.max(0, m.score)),
      reason: m.reason,
    }))
    .filter((m: any) => m.volunteerId)
    .sort((a: any, b: any) => b.score - a.score);

  return new Response(
    JSON.stringify({ matches }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function matchTasksForVolunteer(supabase: any, apiKey: string, volunteerId: string) {
  // Fetch volunteer profile
  const { data: volunteer, error: volError } = await supabase
    .from("profiles")
    .select("id, name, skills, bio")
    .eq("id", volunteerId)
    .single();

  if (volError || !volunteer) {
    return new Response(
      JSON.stringify({ error: `Volunteer not found: ${volError?.message}` }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Fetch open tasks
  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("id, title, description, skills, location, urgency, status")
    .in("status", ["open", "verifying"]);

  if (taskError || !tasks || tasks.length === 0) {
    return new Response(
      JSON.stringify({ matches: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const tasksDesc = tasks.map((t: any, i: number) =>
    `[${i}] "${t.title}" | Skills: ${t.skills.join(", ")} | ${t.description}`
  ).join("\n");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `You are an AI recommendation engine for a volunteering platform. Score how relevant each task is for a specific volunteer based on their skills, experience, and bio. Provide a personalized explanation that references the volunteer's specific skills/experience. Use "you" to address the volunteer directly.`,
        },
        {
          role: "user",
          content: `VOLUNTEER:\nName: ${volunteer.name}\nSkills: ${volunteer.skills.join(", ")}\nBio: ${volunteer.bio}\n\nAVAILABLE TASKS:\n${tasksDesc}\n\nScore each task's relevance for this volunteer.`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "submit_recommendations",
            description: "Submit scored task recommendations for the volunteer",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      index: { type: "integer", description: "Task index from the list" },
                      score: { type: "number", description: "Relevance score 0.0-1.0" },
                      reason: { type: "string", description: "Personalized explanation using 'you' (1-2 sentences)" },
                    },
                    required: ["index", "score", "reason"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["recommendations"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "submit_recommendations" } },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("AI gateway error:", response.status, errText);

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`AI recommendation failed: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall) {
    throw new Error("AI did not return structured recommendations");
  }

  const parsed = JSON.parse(toolCall.function.arguments);
  const matches = (parsed.recommendations || [])
    .map((r: any) => {
      const task = tasks[r.index];
      if (!task) return null;
      return {
        taskId: task.id,
        title: task.title,
        description: task.description,
        skills: task.skills,
        location: task.location,
        status: task.status,
        score: Math.min(1, Math.max(0, r.score)),
        reason: r.reason,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.score - a.score);

  return new Response(
    JSON.stringify({ matches }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
