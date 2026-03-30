-- Enable pgvector extension in public schema so types are accessible
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ===== PROFILES TABLE =====
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('volunteer', 'organizer')),
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== TASKS TABLE =====
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  location TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'verifying', 'completed')),
  urgency TEXT NOT NULL DEFAULT 'low' CHECK (urgency IN ('low', 'medium', 'high')),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks are viewable by everyone"
  ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Organizers can create tasks"
  ON public.tasks FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'organizer')
  );
CREATE POLICY "Organizers can update their own tasks"
  ON public.tasks FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = tasks.creator_id AND profiles.user_id = auth.uid())
  );

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== APPLICATIONS TABLE =====
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'verified')),
  proof_url TEXT,
  verification_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (task_id, volunteer_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Volunteers can view their own applications"
  ON public.applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = applications.volunteer_id AND profiles.user_id = auth.uid())
  );
CREATE POLICY "Organizers can view applications for their tasks"
  ON public.applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks JOIN public.profiles ON profiles.id = tasks.creator_id WHERE tasks.id = applications.task_id AND profiles.user_id = auth.uid())
  );
CREATE POLICY "Volunteers can create applications"
  ON public.applications FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = applications.volunteer_id AND profiles.user_id = auth.uid() AND profiles.role = 'volunteer')
  );
CREATE POLICY "Organizers can update application status"
  ON public.applications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.tasks JOIN public.profiles ON profiles.id = tasks.creator_id WHERE tasks.id = applications.task_id AND profiles.user_id = auth.uid())
  );

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
