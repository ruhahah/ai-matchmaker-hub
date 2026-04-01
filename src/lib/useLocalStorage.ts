import { useState, useEffect } from 'react';

// Generic localStorage hook
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };
    
    // Listen for changes to other tabs
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return [storedValue, setValue];
}

// Database simulation service
export class LocalStorageDB {
  private static instance: LocalStorageDB;
  
  static getInstance(): LocalStorageDB {
    if (!LocalStorageDB.instance) {
      LocalStorageDB.instance = new LocalStorageDB();
    }
    return LocalStorageDB.instance;
  }

  // Generic methods
  private getTable<T>(tableName: string): T[] {
    try {
      const data = localStorage.getItem(tableName);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setTable<T>(tableName: string, data: T[]): void {
    localStorage.setItem(tableName, JSON.stringify(data));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Profiles
  getProfiles(role?: string): any[] {
    const profiles = this.getTable<any>('profiles');
    return role ? profiles.filter(p => p.role === role) : profiles;
  }

  getProfile(id: string): any | null {
    const profiles = this.getProfiles();
    return profiles.find(p => p.id === id) || null;
  }

  createProfile(profile: any): any {
    const profiles = this.getProfiles();
    const newProfile = { ...profile, id: this.generateId(), created_at: new Date().toISOString() };
    profiles.push(newProfile);
    this.setTable('profiles', profiles);
    return newProfile;
  }

  updateProfile(id: string, updates: any): any {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === id);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...updates };
      this.setTable('profiles', profiles);
      return profiles[index];
    }
    return null;
  }

  // Tasks
  getTasks(status?: string): any[] {
    const tasks = this.getTable<any>('tasks');
    return status ? tasks.filter(t => t.status === status) : tasks;
  }

  getTask(id: string): any | null {
    const tasks = this.getTasks();
    return tasks.find(t => t.id === id) || null;
  }

  createTask(task: any): any {
    const tasks = this.getTasks();
    const newTask = { ...task, id: this.generateId(), created_at: new Date().toISOString() };
    tasks.push(newTask);
    this.setTable('tasks', tasks);
    return newTask;
  }

  updateTask(id: string, updates: any): any {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      this.setTable('tasks', tasks);
      return tasks[index];
    }
    return null;
  }

  // Applications
  getApplications(taskId?: string, volunteerId?: string): any[] {
    const applications = this.getTable<any>('applications');
    return applications.filter(app => {
      if (taskId && app.task_id !== taskId) return false;
      if (volunteerId && app.volunteer_id !== volunteerId) return false;
      return true;
    });
  }

  createApplication(application: any): any {
    const applications = this.getApplications();
    const newApplication = { ...application, id: this.generateId(), created_at: new Date().toISOString() };
    applications.push(newApplication);
    this.setTable('applications', applications);
    return newApplication;
  }

  updateApplication(id: string, updates: any): any {
    const applications = this.getApplications();
    const index = applications.findIndex(a => a.id === id);
    if (index !== -1) {
      applications[index] = { ...applications[index], ...updates };
      this.setTable('applications', applications);
      return applications[index];
    }
    return null;
  }

  // Initialize with demo data
  initializeDemoData(): void {
    if (this.getProfiles().length === 0) {
      // Create demo profiles
      const demoProfiles = [
        {
          id: 'mock-volunteer-1',
          name: 'Алексей Волонтер',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          skills: ['Перевод', 'Обучение', 'IT поддержка'],
          bio: 'Опытный волонтер из Астаны с 5+ годами помощи сообществу',
          role: 'volunteer',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-volunteer-2',
          name: 'Екатерина Волонтер',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ekaterina',
          skills: ['Гардening', 'Экология', 'Организация'],
          bio: 'Студентка из АУЭС, люблю помогать в экологических проектах',
          role: 'volunteer',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-volunteer-3',
          name: 'Дмитрий Волонтер',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry',
          skills: ['Животные', 'Ветеринария', 'Уход'],
          bio: 'Ветеринар из Астаны, помогаю приютам для животных',
          role: 'volunteer',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-organizer-1',
          name: 'Мария Организатор',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
          skills: ['Организация', 'Координация', 'Фандрайзинг'],
          bio: 'Профессиональный организатор мероприятий из Астаны',
          role: 'organizer',
          created_at: new Date().toISOString()
        }
      ];
      
      const demoTasks = [
        {
          id: 'mock-task-1',
          title: 'Помощь в переводе документов',
          description: 'Нужна помощь в переводе технической документации с английского на русский. Работа удаленная, но встречи в Астане.',
          skills: ['Перевод', 'Технический английский'],
          location: 'Астана, удаленно',
          status: 'open',
          creator_id: 'mock-organizer-1',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-task-2',
          title: 'Обучение пожилых людей компьютерной грамотности',
          description: 'Проведение занятий по основам работы с компьютером для пенсионеров в районном центре Астаны',
          skills: ['Обучение', 'Компьютерная грамотность'],
          location: 'Астана, центр города',
          status: 'open',
          creator_id: 'mock-organizer-1',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-task-3',
          title: 'Уборка в парке "Астана"',
          description: 'Помощь в весенней уборке парка, сбор мусора и посадка новых деревьев',
          skills: ['Экология', 'Гардening', 'Работа на свежем воздухе'],
          location: 'Астана, парк "Первый Президент"',
          status: 'open',
          creator_id: 'mock-organizer-1',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-task-4',
          title: 'Помощь в приюте для животных',
          description: 'Выгул собак, уборка вольеров, помощь в кормлении животных в приюте на севере Астаны',
          skills: ['Животные', 'Уход', 'Ветеринария'],
          location: 'Астана, приют "Друзья"',
          status: 'open',
          creator_id: 'mock-organizer-1',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-task-5',
          title: 'Организация детского праздника',
          description: 'Помощь в организации праздника для детей из малообеспеченных семей в центре Астаны',
          skills: ['Организация', 'Работа с детьми', 'Творчество'],
          location: 'Астана, Дворец "Молодежный"',
          status: 'open',
          creator_id: 'mock-organizer-1',
          created_at: new Date().toISOString()
        }
      ];

      this.setTable('profiles', demoProfiles);
      this.setTable('tasks', demoTasks);
      this.setTable('applications', []);
    }
  }

  // Volunteer profile operations
  saveVolunteerProfile(profile: any): void {
    const profiles = this.getProfiles();
    const existingIndex = profiles.findIndex(p => p.id === profile.id);
    
    const profileWithEmbedding = {
      ...profile,
      role: 'volunteer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (existingIndex !== -1) {
      profiles[existingIndex] = profileWithEmbedding;
    } else {
      profiles.push(profileWithEmbedding);
    }
    
    this.setTable('profiles', profiles);
  }

  getVolunteerProfile(volunteerId: string): any | null {
    const profiles = this.getProfiles();
    return profiles.find(p => p.id === volunteerId && p.role === 'volunteer') || null;
  }
}

export const localStorageDB = LocalStorageDB.getInstance();
