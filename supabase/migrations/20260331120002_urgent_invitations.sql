-- Create volunteer_invitations table for urgent task notifications
CREATE TABLE IF NOT EXISTS volunteer_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  invitation_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  similarity_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(task_id, volunteer_id)
);

-- Add start_time and required_volunteers columns to tasks table if they don't exist
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS required_volunteers INTEGER DEFAULT 1;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invitations_volunteer ON volunteer_invitations(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON volunteer_invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_expires ON volunteer_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_tasks_start_time ON tasks(start_time);
CREATE INDEX IF NOT EXISTS idx_tasks_urgent ON tasks(status, start_time) WHERE status = 'open';

-- RLS policies
ALTER TABLE volunteer_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-runnable migrations)
DROP POLICY IF EXISTS "Volunteers can view own invitations" ON volunteer_invitations;
DROP POLICY IF EXISTS "Volunteers can update own invitations" ON volunteer_invitations;
DROP POLICY IF EXISTS "System can create invitations" ON volunteer_invitations;

-- Volunteers can view their own invitations
CREATE POLICY "Volunteers can view own invitations" ON volunteer_invitations 
FOR SELECT USING (auth.uid() = volunteer_id);

-- Volunteers can update their own invitations (accept/reject)
CREATE POLICY "Volunteers can update own invitations" ON volunteer_invitations 
FOR UPDATE USING (auth.uid() = volunteer_id);

-- System can create invitations (service role)
CREATE POLICY "System can create invitations" ON volunteer_invitations 
FOR INSERT WITH CHECK (true);

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM volunteer_invitations 
  WHERE status = 'expired' 
  OR (status = 'pending' AND expires_at < NOW());
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending invitations for a volunteer
CREATE OR REPLACE FUNCTION get_pending_invitations(volunteer_uuid UUID)
RETURNS TABLE (
  id UUID,
  task_id UUID,
  task_title TEXT,
  task_description TEXT,
  task_skills TEXT[],
  task_location TEXT,
  task_start_time TIMESTAMP WITH TIME ZONE,
  invitation_text TEXT,
  similarity_score DECIMAL,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.task_id,
    t.title,
    t.description,
    t.skills,
    t.location,
    t.start_time,
    i.invitation_text,
    i.similarity_score,
    i.expires_at
  FROM volunteer_invitations i
  JOIN tasks t ON i.task_id = t.id
  WHERE i.volunteer_id = volunteer_uuid
    AND i.status = 'pending'
    AND i.expires_at > NOW()
  ORDER BY i.similarity_score DESC, t.start_time ASC;
END;
$$ LANGUAGE plpgsql;
