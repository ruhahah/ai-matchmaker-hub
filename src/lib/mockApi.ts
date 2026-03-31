// ===== TYPES =====

export interface Task {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  status: 'open' | 'verifying' | 'completed';
  creatorId: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  bio: string;
  role: 'volunteer' | 'organizer';
}

export interface MatchingResult {
  volunteerId: string;
  volunteerName?: string;
  volunteerSkills?: string[];
  volunteerBio?: string;
  taskId: string;
  score: number;
  reason: string;
}

export interface TaskRecommendation {
  taskId: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  status: string;
  score: number;
  reason: string;
}

export interface IntakeResult {
  title: string;
  description: string;
  skills: string[];
  urgency: 'low' | 'medium' | 'high';
}

export interface VisionResult {
  status: 'approved' | 'rejected';
  confidence: number;
  reason: string;
}

// ===== MOCK DATA (fallback when DB is empty) =====

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Paint community fence', description: 'The fence along Oak Street needs fresh paint. Supplies provided.', skills: ['painting', 'outdoors'], location: 'Oak Street Park', status: 'open', creatorId: 'org1' },
  { id: 't2', title: 'Dog shelter weekend helper', description: 'Help walk and feed dogs at the local shelter on Saturday mornings.', skills: ['animals', 'caregiving'], location: 'Sunshine Animal Shelter', status: 'open', creatorId: 'org1' },
  { id: 't3', title: 'Tutoring for teens', description: 'Provide math and science tutoring for high-school students after school.', skills: ['teaching', 'math', 'science'], location: 'Downtown Library', status: 'verifying', creatorId: 'org1' },
  { id: 't4', title: 'Community garden cleanup', description: 'Spring cleaning at the community garden. Weeding, planting, mulching.', skills: ['gardening', 'outdoors'], location: 'Elm Avenue Garden', status: 'open', creatorId: 'org1' },
  { id: 't5', title: 'Senior tech assistance', description: 'Help senior citizens at the community center learn to use smartphones and tablets.', skills: ['technology', 'patience', 'teaching'], location: 'Golden Years Center', status: 'completed', creatorId: 'org1' },
];

// ===== API FUNCTIONS =====

export async function getTasks(_role: string): Promise<Task[]> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, description, skills, location, status, creator_id')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        skills: t.skills || [],
        location: t.location || '',
        status: t.status as Task['status'],
        creatorId: t.creator_id,
      }));
    }
  } catch (e) {
    console.warn('Falling back to mock tasks:', e);
  }
  await delay(400);
  return [...MOCK_TASKS];
}

export async function getProfiles(_role: string): Promise<Profile[]> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar, skills, bio, role')
      .eq('role', _role === 'organizer' ? 'volunteer' : _role);

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar || '',
        skills: p.skills || [],
        bio: p.bio || '',
        role: p.role as Profile['role'],
      }));
    }
  } catch (e) {
    console.warn('Falling back to mock profiles:', e);
  }
  await delay(300);
  return [];
}

export async function aiIntakeText(rawText: string): Promise<IntakeResult> {
  const { supabase } = await import('@/integrations/supabase/client');

  const { data, error } = await supabase.functions.invoke('ai-intake', {
    body: { rawText },
  });

  if (error) {
    console.error('AI intake error:', error);
    throw new Error(error.message || 'AI processing failed');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    title: data.title,
    description: data.description,
    skills: data.skills,
    urgency: data.urgency,
  };
}

export async function aiSemanticMatching(taskId: string, _profileIds: string[]): Promise<MatchingResult[]> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('semantic-match', {
      body: { taskId, mode: 'volunteers-for-task' },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return (data.matches || []).map((m: any) => ({
      volunteerId: m.volunteerId,
      volunteerName: m.volunteerName,
      volunteerSkills: m.volunteerSkills,
      volunteerBio: m.volunteerBio,
      taskId: m.taskId,
      score: m.score,
      reason: m.reason,
    }));
  } catch (e) {
    console.error('Semantic matching error:', e);
    throw e;
  }
}

export async function aiTaskRecommendations(volunteerId: string): Promise<TaskRecommendation[]> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('semantic-match', {
      body: { taskId: volunteerId, mode: 'tasks-for-volunteer' },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return (data.matches || []).map((m: any) => ({
      taskId: m.taskId,
      title: m.title,
      description: m.description,
      skills: m.skills || [],
      location: m.location || '',
      status: m.status,
      score: m.score,
      reason: m.reason,
    }));
  } catch (e) {
    console.error('Task recommendations error:', e);
    throw e;
  }
}

export async function aiVisionVerify(taskId: string, photoBase64: string): Promise<VisionResult> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('vision-verify', {
      body: { taskId, photoBase64 },
    });

    if (error) {
      console.error('Vision verification error:', error);
      throw new Error(error.message || 'Vision verification failed');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return {
      status: data.status,
      confidence: data.confidence,
      reason: data.reason,
    };
  } catch (e) {
    console.error('Vision verification error:', e);
    throw e;
  }
}
