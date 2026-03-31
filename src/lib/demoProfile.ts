import { localStorageDB } from './useLocalStorage';

export interface DemoVolunteerProfile {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  bio: string;
  completedTasks: number;
  totalHours: number;
  impactAreas: string[];
  achievements: string[];
}

export const getDemoVolunteerProfile = async (volunteerId: string): Promise<DemoVolunteerProfile | null> => {
  try {
    const profile = localStorageDB.getProfile(volunteerId);
    if (!profile) return null;

    const applications = localStorageDB.getApplications(undefined, volunteerId);
    const completedTasks = applications.filter(app => app.status === 'approved').length;

    return {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default',
      skills: profile.skills || [],
      bio: profile.bio || '',
      completedTasks,
      totalHours: completedTasks * 3, // Mock: 3 hours per task
      impactAreas: profile.skills || [],
      achievements: [
        'Первый выполненный проект',
        'Помощь сообществу',
        'Надежный партнер'
      ]
    };
  } catch (error) {
    console.error('Error fetching demo profile:', error);
    return null;
  }
};

export const updateDemoVolunteerProfile = async (
  volunteerId: string,
  updates: Partial<DemoVolunteerProfile>
): Promise<DemoVolunteerProfile> => {
  try {
    const profile = localStorageDB.updateProfile(volunteerId, updates);
    if (!profile) {
      throw new Error('Profile not found');
    }

    return {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default',
      skills: profile.skills || [],
      bio: profile.bio || '',
      completedTasks: 0,
      totalHours: 0,
      impactAreas: profile.skills || [],
      achievements: []
    };
  } catch (error) {
    console.error('Error updating demo profile:', error);
    throw error;
  }
};
