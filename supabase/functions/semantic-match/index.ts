import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
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

    if (!taskId && mode !== "tasks-for-volunteer") {
      return new Response(
        JSON.stringify({ error: "taskId is required for volunteers-for-task mode" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (mode === "tasks-for-volunteer") {
      const { volunteerId } = await req.clone().json();
      return await matchTasksForVolunteer(supabase, LOVABLE_API_KEY, taskId || volunteerId);
    }

    return await matchVolunteersForTask(supabase, LOVABLE_API_KEY, taskId);
  } catch (e) {
    console.error("semantic-match error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function callAI(apiKey: string, messages: any[], tools: any[], toolChoice: any) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
      tools,
      tool_choice: toolChoice,
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
  if (!toolCall) throw new Error("AI did not return structured output");
  return JSON.parse(toolCall.function.arguments);
}

async function matchVolunteersForTask(supabase: any, apiKey: string, taskId: string): Promise<Response> {
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

  const volunteersDesc = volunteers.map((v: any, i: number) =>
    `[${i}] ${v.name} | Skills: ${v.skills.join(", ")} | Bio: ${v.bio}`
  ).join("\n");

  const result = await callAI(
    apiKey,
    [
      {
        role: "system",
        content: `You are an AI matching engine for a volunteering platform. Score how well each volunteer matches a task based on skills, experience, and bio relevance. Be generous but accurate - most volunteers should have scores between 0.5 and 0.99. Provide a brief, specific explanation referencing the volunteer's actual skills/bio. Explain in one sentence in Russian why this volunteer is suitable for this task.`,
      },
      {
        role: "user",
        content: `TASK:\nTitle: ${task.title}\nDescription: ${task.description}\nSkills needed: ${task.skills.join(", ")}\nLocation: ${task.location}\nUrgency: ${task.urgency}\n\nVOLUNTEERS:\n${volunteersDesc}\n\nScore each volunteer's match to this task.`,
      },
    ],
    [
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
                    reason: { type: "string", description: "Brief explanation in Russian" },
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
    { type: "function", function: { name: "submit_matches" } }
  );

  // If callAI returned a Response (error), pass it through
  if (result instanceof Response) return result;

  const matches = (result.matches || [])
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

async function matchTasksForVolunteer(supabase: any, apiKey: string, volunteerId: string): Promise<Response> {
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

  const result = await callAI(
    apiKey,
    [
      {
        role: "system",
        content: `You are an AI recommendation engine for a volunteering platform. Score how relevant each task is for a specific volunteer based on their skills, experience, and bio. Provide a personalized explanation that references the volunteer's specific skills/experience. Use "you" to address the volunteer directly. Explain in one sentence in Russian why this task is suitable for this volunteer.`,
      },
      {
        role: "user",
        content: `VOLUNTEER:\nName: ${volunteer.name}\nSkills: ${volunteer.skills.join(", ")}\nBio: ${volunteer.bio}\n\nAVAILABLE TASKS:\n${tasksDesc}\n\nScore each task's relevance for this volunteer.`,
      },
    ],
    [
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
                    reason: { type: "string", description: "Personalized explanation in Russian using 'you'" },
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
    { type: "function", function: { name: "submit_recommendations" } }
  );

  if (result instanceof Response) return result;

  const matches = (result.recommendations || [])
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
