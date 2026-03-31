-- Fix conflicting table structures from old migrations
-- This migration resolves conflicts between old and new table definitions

-- Drop old profiles table and recreate with correct structure
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Recreate profiles with correct structure (matches new migration)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  user_role TEXT NOT NULL CHECK (user_role IN ('organizer', 'volunteer')),
  name TEXT NOT NULL,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure tasks table has correct structure
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix applications table structure
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS ai_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS ai_reason TEXT;

-- Add missing columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS required_volunteers INTEGER DEFAULT 1;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_tasks_creator ON tasks(creator_id);
CREATE INDEX IF NOT EXISTS idx_applications_task ON applications(task_id);
CREATE INDEX IF NOT EXISTS idx_applications_volunteer ON applications(volunteer_id);

-- Vector indexes for similarity search
CREATE INDEX IF NOT EXISTS idx_profiles_embedding ON profiles USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_tasks_embedding ON tasks USING ivfflat (embedding vector_cosine_ops);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
