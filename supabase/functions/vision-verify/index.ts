import { serve, Request } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId, photoBase64 } = await req.json();

    if (!taskId || typeof taskId !== "string") {
      return new Response(
        JSON.stringify({ error: "taskId is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!photoBase64 || typeof photoBase64 !== "string") {
      return new Response(
        JSON.stringify({ error: "photoBase64 is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch task details
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, title, description, skills, location")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return new Response(
        JSON.stringify({ error: `Task not found: ${taskError?.message}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare the vision analysis request
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an AI vision verification system for a volunteering platform called "Sun Proactive AI Exchange". 
Your task is to analyze a submitted photo and verify if it shows completed work that matches the task description.

TASK DETAILS:
Title: ${task.title}
Description: ${task.description}
Skills Required: ${task.skills.join(", ")}
Location: ${task.location}

ANALYSIS CRITERIA:
1. Does the photo clearly show work related to the task description?
2. Is the quality of work acceptable/satisfactory?
3. Does the photo appear to be authentic (not AI-generated or stolen)?
4. Can you verify that the task appears to be completed?

Be thorough but fair. If the work is partially complete or low quality, consider rejecting. 
If you cannot clearly see the work or it doesn't match the task, reject.

Respond with a JSON object containing:
- status: "approved" or "rejected"
- confidence: number between 0.0 and 1.0
- reason: brief explanation of your decision (1-2 sentences)`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this photo and verify if it shows completed work matching the task description above.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${photoBase64}`,
                },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_vision_result",
              description: "Submit the vision verification result",
              parameters: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: ["approved", "rejected"],
                    description: "Whether the work is approved or rejected",
                  },
                  confidence: {
                    type: "number",
                    minimum: 0.0,
                    maximum: 1.0,
                    description: "Confidence level of the decision (0.0-1.0)",
                  },
                  reason: {
                    type: "string",
                    description: "Brief explanation of the decision (1-2 sentences)",
                  },
                },
                required: ["status", "confidence", "reason"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_vision_result" } },
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Vision analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "submit_vision_result") {
      console.error("Unexpected AI response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI did not return structured output" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("vision-verify error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
