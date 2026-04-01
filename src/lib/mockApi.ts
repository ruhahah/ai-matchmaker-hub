// ===== TYPES =====

import { localStorageDB } from './useLocalStorage';

export interface Task {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  status: 'open' | 'in_progress' | 'completed';
  creatorId: string;
  urgency?: 'low' | 'medium' | 'high';
  requiredVolunteers?: number;
  startTime?: string;
  applications?: any[];
  created_at?: string;
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
  { id: 't1', title: 'Покраска забора в парке', description: 'Покраска забора вдоль парка "Первый Президент". Все материалы предоставляются.', skills: ['painting', 'outdoors'], location: 'Астана, парк "Первый Президент"', status: 'open', creatorId: 'org1' },
  { id: 't2', title: 'Помощь в приюте для животных', description: 'Помощь в выгуле и кормлении собак в местном приюте по субботам.', skills: ['animals', 'caregiving'], location: 'Астана, приют "Друзья"', status: 'open', creatorId: 'org1' },
  { id: 't3', title: 'Репетиторство для подростков', description: 'Проведение занятий по математике и естественным наукам для старшеклассников после школы.', skills: ['teaching', 'math', 'science'], location: 'Астана, Центральная библиотека', status: 'in_progress', creatorId: 'org1' },
  { id: 't4', title: 'Уборка в общественном саду', description: 'Весенняя уборка в общественном саду. Прополка, посадка, мульчирование.', skills: ['gardening', 'outdoors'], location: 'Астана, сад "Эрмитаж"', status: 'open', creatorId: 'org1' },
  { id: 't5', title: 'Техническая помощь пожилым', description: 'Помощь пожилым людям в изучении смартфонов и планшетов в общественном центре.', skills: ['technology', 'patience', 'teaching'], location: 'Астана, центр "Золотые годы"', status: 'completed', creatorId: 'org1' },
];

// ===== API FUNCTIONS =====

export async function getTasks(_role: string): Promise<Task[]> {
  try {
    const { getTasks } = await import('./supabase');
    const data = await getTasks();
    
    if (data && data.length > 0) {
      return data.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        skills: t.skills || [],
        location: t.location || '',
        status: t.status as Task['status'],
        creatorId: t.creator_id,
        requiredVolunteers: t.required_volunteers || 1,
        startTime: t.startTime,
        created_at: t.created_at
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
    const { getProfiles } = await import('./supabase');
    const data = await getProfiles(_role === 'organizer' ? 'volunteer' : _role);
    
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
  return [
    {
      id: 'mock-volunteer-1',
      name: 'Алексей Волонтер',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      skills: ['волонтерство', 'помощь', 'IT поддержка'],
      bio: 'Опытный волонтер из Москвы с 5+ годами помощи сообществу',
      role: 'volunteer' as const,
    },
    {
      id: 'mock-volunteer-2',
      name: 'Екатерина Волонтер',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ekaterina',
      skills: ['экология', 'образование', 'организация'],
      bio: 'Студентка из МГУ, люблю помогать в экологических проектах в Москве',
      role: 'volunteer' as const,
    },
    {
      id: 'mock-organizer-1',
      name: 'Мария Организатор',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      skills: ['организация', 'координация', 'фандрайзинг'],
      bio: 'Профессиональный организатор мероприятий из Москвы',
      role: 'organizer' as const,
    }
  ];
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
      status: result.task.status as 'open' | 'in_progress' | 'completed',
      creatorId: result.task.creator_id,
    };
    
    const matches = result.matches.map(m => ({
      volunteerId: m.volunteer_id,
      volunteerName: 'Volunteer Name', // Mock data
      volunteerSkills: ['General Skills'], // Mock data
      volunteerBio: 'Experienced volunteer', // Mock data
      taskId: result.task.id,
      score: m.score,
      reason: m.reason,
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
  // Mock implementation - parse text locally
  const words = rawText.toLowerCase().split(' ');
  const skills = [];
  
  // Simple skill detection
  if (words.some(w => ['teach', 'tutor', 'education', 'learn'].includes(w))) skills.push('teaching');
  if (words.some(w => ['paint', 'art', 'draw', 'creative'].includes(w))) skills.push('painting');
  if (words.some(w => ['animal', 'pet', 'dog', 'cat'].includes(w))) skills.push('animals');
  if (words.some(w => ['computer', 'tech', 'software', 'digital'].includes(w))) skills.push('technology');
  
  return {
    title: rawText.slice(0, 50) + '...',
    description: rawText,
    skills: skills.length > 0 ? skills : ['general'],
    urgency: 'medium'
  };
}

export async function aiSemanticMatching(taskId: string, profileIds: string[]): Promise<MatchingResult[]> {
  try {
    // Используем demoDatabase вместо localStorageDB
    const { demoDatabase } = await import('./demoDatabase');
    const tasks = demoDatabase.getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.warn('Task not found:', taskId);
      return [];
    }
    
    const profiles = demoDatabase.getProfiles();
    const volunteers = profiles.filter(p => p.role === 'volunteer');
    
    // Создаем мэтчи на основе совпадения навыков и других факторов
    const matches: MatchingResult[] = volunteers.map(volunteer => {
      let score = 0.3; // Базовый скор
      
      // Бонус за совпадение навыков
      const matchingSkills = task.skills?.filter(skill => 
        volunteer.skills.some(volunteerSkill => 
          volunteerSkill.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(volunteerSkill.toLowerCase())
        )
      ) || [];
      
      if (matchingSkills.length > 0) {
        score += (matchingSkills.length * 0.15); // +0.15 за каждый совпавший навык
      }
      
      // Бонус за локацию
      if (task.location && volunteer.location && 
          (task.location.toLowerCase().includes('астана') && volunteer.location.toLowerCase().includes('астана'))) {
        score += 0.2;
      }
      
      // Бонус за опыт
      if (volunteer.stats.tasksCompleted > 10) {
        score += 0.1;
      }
      
      // Бонус за рейтинг
      if (volunteer.stats.rating >= 4.5) {
        score += 0.1;
      }
      
      // Ограничиваем скор
      score = Math.min(score, 1.0);
      
      // Генерируем причину на русском
      let reason = '';
      if (matchingSkills.length > 0) {
        reason = `Отлично подходит по навыкам: ${matchingSkills.join(', ')}`;
      } else if (volunteer.stats.tasksCompleted > 10) {
        reason = 'Опытный волонтер с большим количеством выполненных задач';
      } else {
        reason = 'Хороший кандидат, готов помочь с задачей';
      }
      
      return {
        volunteerId: volunteer.id,
        volunteerName: volunteer.name,
        volunteerSkills: volunteer.skills,
        volunteerBio: volunteer.bio || '',
        taskId,
        score,
        reason
      };
    });
    
    // Сортируем по скору и возвращаем топ-10
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
      
  } catch (e) {
    console.error('Semantic matching error:', e);
    return [];
  }
}

export async function aiTaskRecommendations(volunteerId: string): Promise<TaskRecommendation[]> {
  try {
    const { matchTasksForVolunteer } = await import('./supabase');
    const volunteer = localStorageDB.getProfile(volunteerId);
    if (!volunteer) return [];
    
    const matches = await matchTasksForVolunteer([]); // Empty embedding for mock
    const tasks = localStorageDB.getTasks('open');
    
    return matches.slice(0, 5).map((match, index) => {
      const task = tasks[index];
      return {
        taskId: match.task_id,
        title: task?.title || 'Unknown Task',
        description: task?.description || '',
        skills: task?.skills || [],
        location: task?.location || '',
        status: task?.status || 'open',
        score: match.score,
        reason: match.reason,
      };
    });
  } catch (e) {
    console.error('Task recommendations error:', e);
    return [];
  }
}

export async function getPendingInvitations(volunteerId: string): Promise<VolunteerInvitation[]> {
  try {
    const { getPendingInvitations: getInvitations } = await import('./supabase');
    const invitations = await getInvitations(volunteerId);
    // Map to correct type
    return invitations.map(inv => ({
      id: inv.id,
      task_id: inv.task_id,
      task_title: 'Mock Task Title',
      task_description: 'Mock task description',
      task_skills: ['General'],
      task_location: 'Mock Location',
      task_start_time: new Date().toISOString(),
      invitation_text: 'You are invited to participate!',
      similarity_score: 0.8,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }));
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
    const task = localStorageDB.getTask(taskId);
    if (task) {
      return {
        id: task.id,
        title: task.title,
        description: task.description
      };
    }
    
    // Fallback to mock task
    return {
      id: taskId,
      title: 'Test Task',
      description: 'Test description'
    };
  } catch (e) {
    console.error('Get task error:', e);
    return {
      id: taskId,
      title: 'Test Task',
      description: 'Test description'
    };
  }
}
