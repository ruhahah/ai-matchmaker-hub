-- Create tables for AI Matchmaker Hub

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Profiles table
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

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  embedding vector(1536),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'verifying', 'completed', 'cancelled')),
  location TEXT,
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ai_score DECIMAL(3,2),
  ai_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, volunteer_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_creator ON tasks(creator_id);
CREATE INDEX IF NOT EXISTS idx_tasks_skills ON tasks USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_applications_task ON applications(task_id);
CREATE INDEX IF NOT EXISTS idx_applications_volunteer ON applications(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Vector index for similarity search
CREATE INDEX IF NOT EXISTS idx_profiles_embedding ON profiles USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_tasks_embedding ON tasks USING ivfflat (embedding vector_cosine_ops);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can view all tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Organizers can create tasks" ON tasks FOR INSERT WITH CHECK (
  auth.uid() = creator_id AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'organizer')
);
CREATE POLICY "Organizers can update own tasks" ON tasks FOR UPDATE USING (
  auth.uid() = creator_id AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'organizer')
);

-- Applications policies
CREATE POLICY "Users can view applications for their tasks" ON applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND creator_id = auth.uid())
  OR volunteer_id = auth.uid()
);
CREATE POLICY "Volunteers can create applications" ON applications FOR INSERT WITH CHECK (
  volunteer_id = auth.uid() AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'volunteer')
);
CREATE POLICY "Organizers can update applications" ON applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND creator_id = auth.uid())
);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
