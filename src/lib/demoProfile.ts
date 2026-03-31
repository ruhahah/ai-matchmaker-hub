import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://vnghhecncidqeuoiadpq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface DemoVolunteerProfile {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  bio: string;
  role: 'volunteer';
  rating?: number;
  completedTasks?: number;
  joinedAt?: string;
}

export async function getDemoProfile(): Promise<DemoVolunteerProfile | null> {
  // Check localStorage first
  const storedProfile = localStorage.getItem('demoVolunteerProfile');
  
  if (storedProfile) {
    try {
      return JSON.parse(storedProfile) as DemoVolunteerProfile;
    } catch {
      return null;
    }
  }
  
  // Return default demo profile if no stored profile
  return {
    id: 'demo-volunteer-alikhan',
    name: 'Алихан Смаилов',
    avatar: '',
    skills: ['React', 'Graphic Design', 'Social Media', 'Environmental Volunteering'],
    bio: 'Студент 11 класса, увлекаюсь экологией и IT. Хочу помочьать городу Шымкент становиться чище и современнее.',
    role: 'volunteer' as const,
    rating: 4.8,
    completedTasks: 12,
    joinedAt: new Date(Date.now() - 90 * 24 * 60 * 1000).toISOString()
  };
}

export async function setDemoProfile(profile: DemoVolunteerProfile): Promise<void> {
  localStorage.setItem('demoVolunteerProfile', JSON.stringify(profile));
}

export async function updateDemoProfileRating(rating: number): Promise<void> {
  const profile = await getDemoProfile();
  if (profile) {
    profile.rating = rating;
    await setDemoProfile(profile);
  }
}
