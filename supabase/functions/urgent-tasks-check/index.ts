import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Log request details for debugging
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));

  try {
    // For urgent-tasks-check, we don't need a body - it runs automatically
    // But we'll accept any body for flexibility
    let body = {};
    try {
      body = await req.json();
      console.log("Request body:", body);
    } catch (e) {
      console.log("No body or invalid JSON, continuing...");
    }
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) throw new Error("OPENAI_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get urgent tasks (less than 24 hours away and not enough volunteers)
    const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    const { data: urgentTasks, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        id, 
        title, 
        description, 
        skills,
        location, 
        urgency,
        embedding,
        created_at,
        start_time,
        required_volunteers
      `)
      .eq("status", "open")
      .lt("start_time", twentyFourHoursFromNow)
      .gte("start_time", new Date().toISOString());

    if (tasksError) throw tasksError;

    console.log(`Found ${urgentTasks?.length || 0} urgent tasks`);

    const invitations = [];

    for (const task of urgentTasks || []) {
      // Check current volunteer count
      const { data: applications, error: appError } = await supabase
        .from("applications")
        .select("volunteer_id")
        .eq("task_id", task.id)
        .eq("status", "accepted");

      if (appError) throw appError;

      const currentVolunteerCount = applications?.length || 0;
      const requiredVolunteers = task.required_volunteers || 1;

      if (currentVolunteerCount >= requiredVolunteers) {
        console.log(`Task ${task.id} already has enough volunteers`);
        continue;
      }

      // Find matching volunteers using pgvector
      const { data: matches, error: matchError } = await supabase.rpc('match_volunteers', {
        task_embedding: task.embedding,
        limit_count: 10,
        min_similarity: 0.6
      });

      if (matchError) throw matchError;

      // Filter out already applied volunteers
      const appliedVolunteerIds = applications?.map(app => app.volunteer_id) || [];
      const availableVolunteers = matches?.filter(
        (match: any) => !appliedVolunteerIds.includes(match.volunteer_id)
      ).slice(0, 5) || [];

      console.log(`Found ${availableVolunteers.length} available volunteers for task ${task.id}`);

      // Generate personalized invitations
      for (const volunteer of availableVolunteers) {
        const invitation = await generatePersonalizedInvitation(
          volunteer.volunteer_name,
          volunteer.volunteer_skills,
          volunteer.volunteer_bio,
          task.title,
          task.description,
          task.skills,
          openaiApiKey
        );

        // Save invitation to database
        const { error: inviteError } = await supabase
          .from("volunteer_invitations")
          .insert({
            task_id: task.id,
            volunteer_id: volunteer.volunteer_id,
            invitation_text: invitation,
            status: "pending",
            similarity_score: volunteer.similarity_score,
            expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
          });

        if (inviteError) {
          console.error(`Failed to save invitation: ${inviteError.message}`);
        } else {
          invitations.push({
            taskId: task.id,
            taskTitle: task.title,
            volunteerId: volunteer.volunteer_id,
            volunteerName: volunteer.volunteer_name,
            invitation,
            similarity: volunteer.similarity_score
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        invitations_processed: invitations.length,
        invitations
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (e) {
    console.error("Urgent tasks check error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generatePersonalizedInvitation(
  volunteerName: string,
  volunteerSkills: string[],
  volunteerBio: string,
  taskTitle: string,
  taskDescription: string,
  taskSkills: string[],
  apiKey: string
): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Ты AI-ассистент волонтерской платформы. Создай краткое, персонализированное приглашение для волонтера.
            Будь дружелюбным, убедительным и кратким (максимум 2 предложения). Упомяни конкретные навыки волонтера и почему они подходят для задачи.`
          },
          {
            role: "user",
            content: `ВОЛОНТЕР:
Имя: ${volunteerName}
Навыки: ${volunteerSkills.join(", ")}
О себе: ${volunteerBio}

ЗАДАЧА:
Название: ${taskTitle}
Описание: ${taskDescription}
Требуемые навыки: ${taskSkills.join(", ")}

Создай персонализированное приглашение.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI invitation error:", response.status, errorText);
      return `Привет, ${volunteerName}! У нас есть срочная задача "${taskTitle}", которая идеально подходит твоим навыкам. Поможешь?`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || `Привет, ${volunteerName}! Нужен твой опыт для задачи "${taskTitle}".`;
  } catch (error) {
    console.error("Invitation generation error:", error);
    return `Привет, ${volunteerName}! Есть срочная задача "${taskTitle}" - твоя помощь очень нужна!`;
  }
}
