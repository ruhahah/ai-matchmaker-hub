import { localStorageDB } from './useLocalStorage';

// Types for our database (keeping the same interfaces)
export interface Profile {
  id: string;
  name: string;
  avatar?: string;
  skills: string[];
  bio?: string;
  role: 'volunteer' | 'organizer';
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  creator_id: string;
  created_at: string;
}

export interface Application {
  id: string;
  task_id: string;
  volunteer_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface VolunteerInvitation {
  id: string;
  task_id: string;
  volunteer_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface VolunteerMatch {
  volunteer_id: string;
  score: number;
  reason: string;
}

export interface TaskMatch {
  task_id: string;
  score: number;
  reason: string;
}

// Mock implementations of all Supabase functions
export const getPendingInvitations = async (
  volunteerId: string
): Promise<VolunteerInvitation[]> => {
  // Return empty array for now - can be implemented later
  return [];
};

export const respondToInvitation = async (
  invitationId: string,
  status: 'accepted' | 'rejected'
): Promise<boolean> => {
  // Mock implementation
  return true;
};

export const acceptInvitationAndApply = async (
  invitationId: string,
  taskId: string,
  volunteerId: string
): Promise<any> => {
  // Mock implementation
  return { success: true };
};

// Mock AI matching functions
export const matchVolunteers = async (
  taskEmbedding: number[],
  limitCount = 10,
  minSimilarity = 0.5
): Promise<VolunteerMatch[]> => {
  const volunteers = localStorageDB.getProfiles('volunteer');
  return volunteers.map(volunteer => ({
    volunteer_id: volunteer.id,
    score: Math.random() * 0.4 + 0.6, // Random score between 0.6 and 1.0
    reason: `Отличное совпадение по навыкам: ${volunteer.skills.slice(0, 2).join(', ')}`
  })).slice(0, limitCount);
};

export const matchTasksForVolunteer = async (
  volunteerEmbedding: number[],
  limitCount = 10,
  minSimilarity = 0.5
): Promise<TaskMatch[]> => {
  const tasks = localStorageDB.getTasks('open');
  return tasks.map(task => ({
    task_id: task.id,
    score: Math.random() * 0.4 + 0.6, // Random score between 0.6 and 1.0
    reason: `Идеально подходит для ваших навыков: ${task.skills.slice(0, 2).join(', ')}`
  })).slice(0, limitCount);
};

export const updateProfileEmbedding = async (
  profileId: string,
  embedding: number[]
): Promise<boolean> => {
  // Mock implementation
  return true;
};

export const updateTaskEmbedding = async (
  taskId: string,
  embedding: number[]
): Promise<boolean> => {
  // Mock implementation
  return true;
};

// Database operations
export const getProfile = async (userId: string): Promise<Profile | null> => {
  return localStorageDB.getProfile(userId);
};

export const createProfile = async (profile: Partial<Profile>): Promise<Profile> => {
  return localStorageDB.createProfile(profile);
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> => {
  const result = localStorageDB.updateProfile(userId, updates);
  if (!result) {
    throw new Error('Profile not found');
  }
  return result;
};

export const getTasks = async (
  status?: Task['status']
): Promise<Task[]> => {
  return localStorageDB.getTasks(status);
};

export const createTask = async (task: Partial<Task>): Promise<Task> => {
  return localStorageDB.createTask(task);
};

export const updateTask = async (
  taskId: string,
  updates: Partial<Task>
): Promise<Task> => {
  const result = localStorageDB.updateTask(taskId, updates);
  if (!result) {
    throw new Error('Task not found');
  }
  return result;
};

export const getApplications = async (
  taskId?: string,
  volunteerId?: string
): Promise<Application[]> => {
  return localStorageDB.getApplications(taskId, volunteerId);
};

export const createApplication = async (
  application: Partial<Application>
): Promise<Application> => {
  return localStorageDB.createApplication(application);
};

export const updateApplication = async (
  applicationId: string,
  updates: Partial<Application>
): Promise<Application> => {
  const result = localStorageDB.updateApplication(applicationId, updates);
  if (!result) {
    throw new Error('Application not found');
  }
  return result;
};

// Initialize demo data
export const initializeDemoData = () => {
  localStorageDB.initializeDemoData();
};
