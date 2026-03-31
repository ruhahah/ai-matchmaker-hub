-- RPC function for matching volunteers using cosine similarity
CREATE OR REPLACE FUNCTION match_volunteers(
  task_embedding vector(1536),
  limit_count INTEGER DEFAULT 10,
  min_similarity DECIMAL DEFAULT 0.5
)
RETURNS TABLE (
  volunteer_id UUID,
  volunteer_name TEXT,
  volunteer_skills TEXT[],
  volunteer_bio TEXT,
  similarity_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as volunteer_id,
    p.name as volunteer_name,
    p.skills as volunteer_skills,
    p.bio as volunteer_bio,
    1 - (p.embedding <=> task_embedding) as similarity_score
  FROM profiles p
  WHERE 
    p.user_role = 'volunteer'
    AND p.embedding IS NOT NULL
    AND (1 - (p.embedding <=> task_embedding)) >= min_similarity
  ORDER BY similarity_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- RPC function for matching tasks for volunteers using cosine similarity
CREATE OR REPLACE FUNCTION match_tasks_for_volunteer(
  volunteer_embedding vector(1536),
  limit_count INTEGER DEFAULT 10,
  min_similarity DECIMAL DEFAULT 0.5
)
RETURNS TABLE (
  task_id UUID,
  task_title TEXT,
  task_description TEXT,
  task_skills TEXT[],
  task_location TEXT,
  task_status TEXT,
  similarity_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as task_id,
    t.title as task_title,
    t.description as task_description,
    t.skills as task_skills,
    t.location as task_location,
    t.status as task_status,
    1 - (t.embedding <=> volunteer_embedding) as similarity_score
  FROM tasks t
  WHERE 
    t.status IN ('open', 'verifying')
    AND t.embedding IS NOT NULL
    AND (1 - (t.embedding <=> volunteer_embedding)) >= min_similarity
  ORDER BY similarity_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Helper function to update embeddings
CREATE OR REPLACE FUNCTION update_profile_embedding(
  profile_id UUID,
  new_embedding vector(1536)
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles 
  SET embedding = new_embedding 
  WHERE id = profile_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Helper function to update task embedding
CREATE OR REPLACE FUNCTION update_task_embedding(
  task_id UUID,
  new_embedding vector(1536)
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE tasks 
  SET embedding = new_embedding 
  WHERE id = task_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
