// ===== TYPES =====

export interface Task {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  status: 'open' | 'verifying' | 'completed';
  creatorId: string;
  urgency?: 'low' | 'medium' | 'high';
  requiredVolunteers?: number;
  startTime?: string;
  applications?: any[];
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
  ai_reason?: string;
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

export interface VolunteerInvitation {
  id: string;
  task_id: string;
  task_title: string;
  task_description: string;
  task_skills: string[];
  task_location: string;
  task_start_time: string;
  invitation_text: string;
  similarity_score: number;
  expires_at: string;
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

export async function createTaskWithAI(taskData: {
  title: string;
  description: string;
  skills: string[];
  location?: string;
  urgency: 'low' | 'medium' | 'high';
  creatorId: string;
}): Promise<{ task: Task; matches: MatchingResult[] }> {
  try {
    const { createTaskWithMatching } = await import('./ai-service');
    const result = await createTaskWithMatching(taskData);
    
    // Convert to our mock types
    const task: Task = {
      id: result.task.id,
      title: result.task.title,
      description: result.task.description,
      skills: result.task.skills,
      location: result.task.location || '',
      status: result.task.status,
      creatorId: result.task.creator_id,
    };
    
    const matches = result.matches.map(m => ({
      volunteerId: m.volunteer_id,
      volunteerName: m.volunteer_name,
      volunteerSkills: m.volunteer_skills,
      volunteerBio: m.volunteer_bio,
      taskId: result.task.id,
      score: m.similarity_score,
      reason: 'AI-powered semantic match',
      ai_reason: m.ai_reason,
    }));
    
    return { task, matches };
  } catch (error) {
    console.error('Create task with AI error:', error);
    throw error;
  }
}

export async function updateProfileWithAI(profileId: string, profileData: {
  name?: string;
  bio?: string;
  skills?: string[];
}): Promise<Profile> {
  try {
    const { updateProfileWithEmbedding } = await import('./ai-service');
    const result = await updateProfileWithEmbedding(profileId, profileData);
    
    return {
      id: result.id,
      name: result.name,
      avatar: '', // We'll need to add this field
      skills: result.skills,
      bio: result.bio || '',
      role: result.user_role,
    };
  } catch (error) {
    console.error('Update profile with AI error:', error);
    throw error;
  }
}

export async function aiIntakeText(rawText: string): Promise<IntakeResult> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('ai-intake', {
      body: { rawText },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return {
      title: data.title,
      description: data.description,
      skills: data.skills || [],
      urgency: data.urgency || 'medium',
    };
  } catch (error) {
    console.error('AI intake error:', error);
    return {
      title: rawText.slice(0, 50) + '...',
      description: rawText,
      skills: ['general'],
      urgency: 'medium'
    };
  }
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

export async function getPendingInvitations(volunteerId: string): Promise<VolunteerInvitation[]> {
  try {
    const { getPendingInvitations: getInvitations } = await import('./supabase');
    const invitations = await getInvitations(volunteerId);
    return invitations;
  } catch (e) {
    console.warn('Falling back to mock invitations:', e);
    // Mock urgent invitation for testing
    const mockInvitation: VolunteerInvitation = {
      id: 'inv1',
      task_id: 't1',
      task_title: 'Срочная помощь в парке',
      task_description: 'Нужно помочь с уборкой территории перед мероприятием завтра',
      task_skills: ['уборка', 'работа на свежем воздухе'],
      task_location: 'Центральный парк',
      task_start_time: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
      invitation_text: 'Привет! Мы видим, у тебя есть опыт в работе на свежем воздухе, а завтра в парке как раз нужна срочная помощь. Поможешь нам?',
      similarity_score: 0.85,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    };
    await delay(300);
    return [mockInvitation];
  }
}

export async function respondToInvitation(
  invitationId: string,
  status: 'accepted' | 'rejected'
): Promise<boolean> {
  try {
    const { respondToInvitation: respond } = await import('./supabase');
    return await respond(invitationId, status);
  } catch (e) {
    console.warn('Falling back to mock invitation response:', e);
    await delay(200);
    return true;
  }
}

export async function acceptInvitationAndApply(
  invitationId: string,
  taskId: string,
  volunteerId: string
): Promise<any> {
  try {
    const { acceptInvitationAndApply: acceptApply } = await import('./supabase');
    return await acceptApply(invitationId, taskId, volunteerId);
  } catch (e) {
    console.warn('Falling back to mock accept and apply:', e);
    await delay(400);
    return { id: 'app1', task_id: taskId, volunteer_id: volunteerId, status: 'pending' };
  }
}

export async function aiVisionVerify(taskId: string, photoBase64: string): Promise<VisionResult> {
  try {
    // Get task details for context
    const task = await getTaskById(taskId);
    
    const { aiVisionVerify: visionVerify } = await import('./ai-service');
    const result = await visionVerify(photoBase64, task.description, task.title);
    
    // If approved, update task status to completed
    if (result.status === 'approved') {
      const { updateTask } = await import('./supabase');
      await updateTask(taskId, { status: 'completed' });
    }
    
    return {
      status: result.status,
      confidence: result.confidence,
      reason: result.reason,
    };
  } catch (error) {
    console.error('Vision verification error:', error);
    throw error;
  }
}

// Helper function to get task by ID
async function getTaskById(taskId: string): Promise<{ id: string; title: string; description: string }> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, description')
      .eq('id', taskId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (e) {
    // Fallback to mock task
    return {
      id: taskId,
      title: 'Test Task',
      description: 'Test description'
    };
  }
}
