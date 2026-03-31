import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

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
    const { message, conversationHistory } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "message is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) throw new Error("OPENAI_API_KEY is not configured");

    // Prepare conversation history for context
    const messages = [
      {
        role: "system",
        content: `Ты — эксперт-координатор Sun Proactive. Твоя цель — собрать полные данные о социальной задаче. Будь кратким и дружелюбным. Если данных достаточно — верни JSON, если нет — задай один уточняющий вопрос.

Схема данных задачи:
{
  "title": "краткое название задачи",
  "description": "подробное описание что нужно сделать",
  "location": "где будет проходить",
  "date": "YYYY-MM-DD формат",
  "required_volunteers": "число (минимум 1)",
  "skills": ["список", "нужных", "навыков"],
  "urgency": "low|medium|high"
}

Правила:
- Если пользователь не указал дату — спроси дату
- Если не указано место — спроси место  
- Если не указано сколько нужно людей — спроси число
- Если указаны все данные — верни только JSON без дополнительных текста
- Будь дружелюбным и кратким`
      },
      ...(conversationHistory || []),
      {
        role: "user",
        content: message
      }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "task_creation_response",
            schema: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["question", "task_data"],
                  description: "Если нужно задать вопрос - 'question', если данные готовы - 'task_data'"
                },
                content: {
                  oneOf: [
                    {
                      type: "string",
                      description: "Уточняющий вопрос пользователю"
                    },
                    {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        location: { type: "string" },
                        date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                        required_volunteers: { type: "integer", minimum: 1 },
                        skills: {
                          type: "array",
                          items: { type: "string" }
                        },
                        urgency: {
                          type: "string",
                          enum: ["low", "medium", "high"]
                        }
                      },
                      required: ["title", "description", "location", "date", "required_volunteers", "skills", "urgency"]
                    }
                  ]
                }
              },
              required: ["type", "content"]
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI interviewer error:", response.status, errorText);
      throw new Error(`AI interview failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("AI did not return a response");
    }

    const parsedResponse = JSON.parse(aiResponse);

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("AiTaskCreator error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
