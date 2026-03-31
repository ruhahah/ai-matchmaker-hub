import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Profile {
  id: string
  user_role: 'organizer' | 'volunteer'
  name: string
  bio?: string
  skills: string[]
  embedding?: number[]
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  creator_id: string
  title: string
  description: string
  skills: string[]
  embedding?: number[]
  status: 'open' | 'verifying' | 'completed' | 'cancelled'
  location?: string
  urgency: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  task_id: string
  volunteer_id: string
  ai_score?: number
  ai_reason?: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export interface VolunteerMatch {
  volunteer_id: string
  volunteer_name: string
  volunteer_skills: string[]
  volunteer_bio: string
  similarity_score: number
}

export interface TaskMatch {
  task_id: string
  task_title: string
  task_description: string
  task_skills: string[]
  task_location?: string
  task_status: string
  similarity_score: number
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

// RPC function calls for urgent invitations
export const getPendingInvitations = async (
  volunteerId: string
): Promise<VolunteerInvitation[]> => {
  const { data, error } = await supabase.rpc('get_pending_invitations', {
    volunteer_uuid: volunteerId
  });

  if (error) throw error;
  return data || [];
};

export const respondToInvitation = async (
  invitationId: string,
  status: 'accepted' | 'rejected'
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('volunteer_invitations')
    .update({ 
      status, 
      responded_at: new Date().toISOString() 
    })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) throw error;
  return !!data;
};

export const acceptInvitationAndApply = async (
  invitationId: string,
  taskId: string,
  volunteerId: string
): Promise<Application> => {
  // First respond to invitation
  await respondToInvitation(invitationId, 'accepted');
  
  // Then create application
  return await createApplication({
    task_id: taskId,
    volunteer_id: volunteerId,
    status: 'pending'
  });
};

// RPC function calls
export const matchVolunteers = async (
  taskEmbedding: number[],
  limitCount = 10,
  minSimilarity = 0.5
): Promise<VolunteerMatch[]> => {
  const { data, error } = await supabase.rpc('match_volunteers', {
    task_embedding: taskEmbedding,
    limit_count: limitCount,
    min_similarity: minSimilarity
  })

  if (error) throw error
  return data || []
}

export const matchTasksForVolunteer = async (
  volunteerEmbedding: number[],
  limitCount = 10,
  minSimilarity = 0.5
): Promise<TaskMatch[]> => {
  const { data, error } = await supabase.rpc('match_tasks_for_volunteer', {
    volunteer_embedding: volunteerEmbedding,
    limit_count: limitCount,
    min_similarity: minSimilarity
  })

  if (error) throw error
  return data || []
}

export const updateProfileEmbedding = async (
  profileId: string,
  embedding: number[]
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('update_profile_embedding', {
    profile_id: profileId,
    new_embedding: embedding
  })

  if (error) throw error
  return data || false
}

export const updateTaskEmbedding = async (
  taskId: string,
  embedding: number[]
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('update_task_embedding', {
    task_id: taskId,
    new_embedding: embedding
  })

  if (error) throw error
  return data || false
}

// Database operations
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export const createProfile = async (profile: Partial<Profile>): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getTasks = async (
  status?: Task['status']
): Promise<Task[]> => {
  let query = supabase.from('tasks').select('*')
  
  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const createTask = async (task: Partial<Task>): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateTask = async (
  taskId: string,
  updates: Partial<Task>
): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getApplications = async (
  taskId?: string,
  volunteerId?: string
): Promise<Application[]> => {
  let query = supabase.from('applications').select('*')

  if (taskId) query = query.eq('task_id', taskId)
  if (volunteerId) query = query.eq('volunteer_id', volunteerId)

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const createApplication = async (
  application: Partial<Application>
): Promise<Application> => {
  const { data, error } = await supabase
    .from('applications')
    .insert(application)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateApplication = async (
  applicationId: string,
  updates: Partial<Application>
): Promise<Application> => {
  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', applicationId)
    .select()
    .single()

  if (error) throw error
  return data
}
