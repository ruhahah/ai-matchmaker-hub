/// <reference path="./deno-types.d.ts" />
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
    const { volunteerId } = await req.json();

    if (!volunteerId || typeof volunteerId !== "string") {
      return new Response(
        JSON.stringify({ error: "volunteerId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch volunteer profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, skills, bio")
      .eq("id", volunteerId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Volunteer not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch completed applications for this volunteer
    const { data: applications } = await supabase
      .from("applications")
      .select("task_id, status")
      .eq("volunteer_id", volunteerId)
      .eq("status", "approved");

    // Fetch corresponding tasks
    let completedTasks: any[] = [];
    if (applications && applications.length > 0) {
      const taskIds = applications.map((a: any) => a.task_id);
      const { data: tasks } = await supabase
        .from("tasks")
        .select("title, description, skills, location")
        .in("id", taskIds);
      completedTasks = tasks || [];
    }

    // Also check tasks with status 'completed' that this volunteer worked on
    const { data: completedTasksDirect } = await supabase
      .from("tasks")
      .select("title, description, skills, location")
      .eq("status", "completed");

    const allTasks = [...completedTasks, ...(completedTasksDirect || [])];

    // Build context for the LLM
    const tasksDescription = allTasks.length > 0
      ? allTasks.map((t: any, i: number) =>
          `${i + 1}. "${t.title}" — ${t.description} (навыки: ${t.skills?.join(", ") || "нет"}, место: ${t.location || "не указано"})`
        ).join("\n")
      : "Волонтёр пока не завершил ни одной задачи, но активно зарегистрирован на платформе.";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Ты — AI-аналитик волонтёрской платформы "Sun Proactive AI Exchange". Твоя задача — создать вдохновляющий и персонализированный профиль волонтёра на основе его завершённых задач и навыков.

Будь конкретным, тёплым и мотивирующим. Используй данные из задач для создания правдоподобных и вдохновляющих выводов. Если задач мало или нет — ориентируйся на навыки из профиля и дай обнадёживающий прогноз.`,
          },
          {
            role: "user",
            content: `ПРОФИЛЬ ВОЛОНТЁРА:
Имя: ${profile.name}
Навыки: ${profile.skills?.join(", ") || "не указаны"}
О себе: ${profile.bio || "не указано"}

ЗАВЕРШЁННЫЕ ЗАДАЧИ:
${tasksDescription}

Создай AI Impact Summary для этого волонтёра.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_impact_summary",
              description: "Submit the AI-generated impact summary for the volunteer",
              parameters: {
                type: "object",
                properties: {
                  archetype: {
                    type: "string",
                    description: "Короткий яркий архетип волонтёра на русском (2-3 слова), например: 'Эко-Активист', 'Цифровой Наставник', 'Защитник Животных', 'Мастер на все руки'",
                  },
                  archetype_emoji: {
                    type: "string",
                    description: "Один эмодзи, лучше всего отражающий архетип",
                  },
                  impact_summary: {
                    type: "string",
                    description: "Суммарный эффект деятельности волонтёра — одно конкретное предложение на русском, начинающееся с 'Благодаря тебе...'. Включи конкретные цифры или детали из задач.",
                  },
                  forecast: {
                    type: "string",
                    description: "Персонализированный прогноз на русском — одно предложение, начинающееся с 'Твои навыки... могут...'. Укажи конкретные навыки и потенциал.",
                  },
                  streak_text: {
                    type: "string",
                    description: "Мотивирующая фраза о прогрессе на русском (короткая, 5-10 слов)",
                  },
                },
                required: ["archetype", "archetype_emoji", "impact_summary", "forecast", "streak_text"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_impact_summary" } },
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
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "submit_impact_summary") {
      console.error("Unexpected AI response:", JSON.stringify(data));
      throw new Error("AI did not return structured output");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        ...result,
        completed_tasks_count: allTasks.length,
        volunteer_name: profile.name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-impact-summary error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
