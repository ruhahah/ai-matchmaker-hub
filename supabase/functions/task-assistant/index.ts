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
    const { taskId, message, conversationHistory } = await req.json();

    if (!taskId || typeof taskId !== "string") {
      return new Response(
        JSON.stringify({ error: "taskId is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "message is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) throw new Error("OPENAI_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch task details for RAG context
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        description,
        location,
        start_time,
        required_volunteers,
        skills,
        urgency
      `)
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return new Response(
        JSON.stringify({ error: `Task not found: ${taskError?.message}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create RAG context from task details
    const taskContext = `
ЗАДАЧА: ${task.title}
ОПИСАНИЕ: ${task.description}
ЛОКАЦИЯ: ${task.location}
ДАТА И ВРЕМЯ: ${new Date(task.start_time).toLocaleString('ru-RU')}
ТРЕБУЕТСЯ ВОЛОНТЕРОВ: ${task.required_volunteers}
НУЖНЫЕ НАВЫКИ: ${task.skills.join(', ')}
СРОЧНОСТЬ: ${task.urgency}
`.trim();

    // Prepare conversation history
    const messages = [
      {
        role: "system",
        content: `Ты — ассистент конкретной задачи: ${taskContext}. 
Отвечай на вопросы волонтера ТОЛЬКО на основе этого текста. 
Если в тексте нет ответа (например, волонтер спрашивает про оплату, а в тексте этого нет), отвечай: «К сожалению, в описании задачи это не указано, уточните у организатора». 
Не галлюцинируй! Будь кратким и дружелюбным.`
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
        temperature: 0.3,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Task assistant error:", response.status, errorText);
      throw new Error(`AI assistant failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("AI did not return a response");
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        taskId: taskId,
        context: taskContext
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("TaskAssistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
