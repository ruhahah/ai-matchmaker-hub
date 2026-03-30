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
    const { type, id } = await req.json();

    if (!type || !id) {
      return new Response(
        JSON.stringify({ error: "type ('task' | 'profile') and id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type !== "task" && type !== "profile") {
      return new Response(
        JSON.stringify({ error: "type must be 'task' or 'profile'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the record
    let textForEmbedding: string;

    if (type === "task") {
      const { data, error } = await supabase
        .from("tasks")
        .select("title, description, skills, location, urgency")
        .eq("id", id)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: `Task not found: ${error?.message}` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      textForEmbedding = [
        `Task: ${data.title}`,
        `Description: ${data.description}`,
        `Skills needed: ${(data.skills || []).join(", ")}`,
        `Location: ${data.location || "unspecified"}`,
        `Urgency: ${data.urgency}`,
      ].join("\n");

    } else {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, bio, skills, role")
        .eq("id", id)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: `Profile not found: ${error?.message}` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      textForEmbedding = [
        `Volunteer: ${data.name}`,
        `Bio: ${data.bio || ""}`,
        `Skills: ${(data.skills || []).join(", ")}`,
        `Role: ${data.role}`,
      ].join("\n");
    }

    // Generate embedding via Lovable AI gateway (OpenAI-compatible embeddings endpoint)
    const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/text-embedding-3-small",
        input: textForEmbedding,
      }),
    });

    if (!embeddingResponse.ok) {
      const errText = await embeddingResponse.text();
      console.error("Embedding API error:", embeddingResponse.status, errText);

      if (embeddingResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (embeddingResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Embedding generation failed: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data?.[0]?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      console.error("Unexpected embedding response:", JSON.stringify(embeddingData));
      throw new Error("Invalid embedding response format");
    }

    // Save embedding to DB
    const table = type === "task" ? "tasks" : "profiles";
    const { error: updateError } = await supabase
      .from(table)
      .update({ embedding: JSON.stringify(embedding) })
      .eq("id", id);

    if (updateError) {
      console.error("DB update error:", updateError);
      throw new Error(`Failed to save embedding: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        type,
        id,
        dimensions: embedding.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("generate-embedding error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
