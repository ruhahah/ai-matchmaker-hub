-- Move vector extension to extensions schema
ALTER EXTENSION vector SET SCHEMA extensions;

-- Update columns to use extensions-qualified type
ALTER TABLE public.profiles ALTER COLUMN embedding TYPE extensions.vector(1536);
ALTER TABLE public.tasks ALTER COLUMN embedding TYPE extensions.vector(1536);

-- RPC: match tasks by embedding (cosine similarity)
CREATE OR REPLACE FUNCTION public.match_tasks_by_embedding(
  query_embedding extensions.vector(1536),
  match_threshold FLOAT DEFAULT 0.8,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  skills TEXT[],
  location TEXT,
  status TEXT,
  creator_id UUID,
  similarity FLOAT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.description,
    t.skills,
    t.location,
    t.status,
    t.creator_id,
    (1 - (t.embedding <=> query_embedding))::FLOAT AS similarity
  FROM public.tasks t
  WHERE t.status = 'open'
    AND t.embedding IS NOT NULL
    AND (1 - (t.embedding <=> query_embedding)) > match_threshold
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- RPC: match volunteers to a task (cosine similarity)
CREATE OR REPLACE FUNCTION public.match_volunteers_to_task(
  task_uuid UUID,
  match_threshold FLOAT DEFAULT 0.8,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  volunteer_id UUID,
  name TEXT,
  skills TEXT[],
  bio TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS volunteer_id,
    p.name,
    p.skills,
    p.bio,
    (1 - (p.embedding <=> t.embedding))::FLOAT AS similarity
  FROM public.profiles p
  CROSS JOIN public.tasks t
  WHERE t.id = task_uuid
    AND p.role = 'volunteer'
    AND p.embedding IS NOT NULL
    AND t.embedding IS NOT NULL
    AND (1 - (p.embedding <=> t.embedding)) > match_threshold
  ORDER BY p.embedding <=> t.embedding
  LIMIT match_count;
END;
$$;
