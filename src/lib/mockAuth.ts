import { useLocalStorage } from './useLocalStorage';
import { useState } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'volunteer' | 'organizer';
  avatar?: string;
  skills?: string[];
  bio?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: 'mock-volunteer-1',
    email: 'volunteer@example.com',
    name: 'Алексей Волонтер',
    role: 'volunteer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    skills: ['Перевод', 'Обучение', 'IT поддержка'],
    bio: 'Опытный волонтер с 5+ годами помощи'
  },
  {
    id: 'mock-organizer-1',
    email: 'organizer@example.com',
    name: 'Мария Организатор',
    role: 'organizer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    skills: ['Организация', 'Координация', 'Фандрайзинг'],
    bio: 'Профессиональный организатор мероприятий'
  }
];

export class MockAuthService {
  private static instance: MockAuthService;
  
  static getInstance(): MockAuthService {
    if (!MockAuthService.instance) {
      MockAuthService.instance = new MockAuthService();
    }
    return MockAuthService.instance;
  }

  // Simulate login
  async signIn(email: string, password: string): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user by email (ignore password in mock)
    const user = MOCK_USERS.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Save to localStorage
    localStorage.setItem('mockAuthUser', JSON.stringify(user));
    return user;
  }

  // Simulate registration
  async signUp(userData: {
    email: string;
    password: string;
    name: string;
    role: 'volunteer' | 'organizer';
    skills?: string[];
    bio?: string;
  }): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Create new user
    const newUser: User = {
      id: `mock-${Date.now()}`,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      skills: userData.skills || [],
      bio: userData.bio || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`
    };
    
    // Save to localStorage
    localStorage.setItem('mockAuthUser', JSON.stringify(newUser));
    return newUser;
  }

  // Simulate logout
  async signOut(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    localStorage.removeItem('mockAuthUser');
  }

  // Get current user
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('mockAuthUser');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Simulate session check
  async getSession(): Promise<User | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return this.getCurrentUser();
  }
}

export const mockAuthService = MockAuthService.getInstance();

// React hook for auth state
export function useAuth() {
  const [user, setUser] = useLocalStorage<User | null>('mockAuthUser', null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await mockAuthService.signIn(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: {
    email: string;
    password: string;
    name: string;
    role: 'volunteer' | 'organizer';
    skills?: string[];
    bio?: string;
  }) => {
    setIsLoading(true);
    try {
      const newUser = await mockAuthService.signUp(userData);
      setUser(newUser);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await mockAuthService.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut
  };
}
