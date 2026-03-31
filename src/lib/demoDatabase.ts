// Demo Database with Friends System
export interface DemoProfile {
  id: string;
  name: string;
  email: string;
  role: 'volunteer' | 'organizer';
  bio: string;
  avatar: string;
  location: string;
  skills: string[];
  friends: string[];
  friendRequests: {
    sent: string[];
    received: string[];
  };
  stats: {
    tasksCompleted: number;
    hoursVolunteered: number;
    rating: number;
  };
  invitations: VolunteerInvitation[];
}

export interface DemoTask {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  requiredVolunteers: number;
  skills: string[];
  urgency: 'low' | 'medium' | 'high';
  status: string;
  creatorId: string;
  invitedFriends: string[];
  maxFriends?: number;
  requiresTeam?: boolean;
}

export interface VolunteerInvitation {
  id: string;
  task_id: string;
  taskTitle: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  inviteeName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  respondedAt: Date | null;
}

// Demo Users Database
export const DEMO_USERS: DemoProfile[] = [
  {
    id: 'user-1',
    name: 'Александр Петров',
    email: 'alex.petrov@example.com',
    role: 'volunteer',
    bio: 'Студент-программист, люблю помогать людям и изучать новые технологии',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=alex&style=bear',
    location: 'Москва',
    skills: ['Программирование', 'Организация мероприятий', 'Английский язык'],
    friends: ['user-2', 'user-3', 'user-4'],
    friendRequests: {
      sent: ['user-5'],
      received: ['user-6']
    },
    stats: {
      tasksCompleted: 12,
      hoursVolunteered: 48,
      rating: 4.8
    },
    invitations: []
  },
  {
    id: 'user-2',
    name: 'Мария Соколова',
    email: 'maria.sokolova@example.com',
    role: 'volunteer',
    bio: 'Волонтер с 3-летним стажем, координатор экологических акций',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=maria&style=bear',
    location: 'Москва',
    skills: ['Экология', 'Координация', 'SMM', 'Фотография'],
    friends: ['user-1', 'user-3', 'user-7'],
    friendRequests: {
      sent: [],
      received: ['user-8']
    },
    stats: {
      tasksCompleted: 28,
      hoursVolunteered: 112,
      rating: 4.9
    },
    invitations: []
  },
  {
    id: 'user-3',
    name: 'Дмитрий Иванов',
    email: 'dmitry.ivanov@example.com',
    role: 'volunteer',
    bio: 'IT-специалист, увлекаюсь спортом и волонтерством',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=dmitry&style=bear',
    location: 'Москва',
    skills: ['IT', 'Спорт', 'Тренерство', 'Переводы'],
    friends: ['user-1', 'user-2', 'user-4'],
    friendRequests: {
      sent: ['user-9'],
      received: []
    },
    stats: {
      tasksCompleted: 8,
      hoursVolunteered: 32,
      rating: 4.7
    },
    invitations: []
  },
  {
    id: 'user-4',
    name: 'Елена Козлова',
    email: 'elena.kozlova@example.com',
    role: 'volunteer',
    bio: 'Дизайнер и фотограф, люблю творческие проекты',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=elena&style=bear',
    location: 'Москва',
    skills: ['Дизайн', 'Фотография', 'Видеомонтаж', 'SMM'],
    friends: ['user-1', 'user-3'],
    friendRequests: {
      sent: [],
      received: ['user-10']
    },
    stats: {
      tasksCompleted: 15,
      hoursVolunteered: 60,
      rating: 4.6
    },
    invitations: []
  },
  {
    id: 'user-5',
    name: 'Михаил Волков',
    email: 'mikhail.volkov@example.com',
    role: 'volunteer',
    bio: 'Медик, волонтер в скорой помощи',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=mikhail&style=bear',
    location: 'Москва',
    skills: ['Медицина', 'Первая помощь', 'Психология'],
    friends: ['user-6', 'user-7'],
    friendRequests: {
      sent: ['user-1'],
      received: ['user-11']
    },
    stats: {
      tasksCompleted: 20,
      hoursVolunteered: 80,
      rating: 4.9
    },
    invitations: []
  },
  {
    id: 'user-6',
    name: 'Анна Белова',
    email: 'anna.belova@example.com',
    role: 'volunteer',
    bio: 'Учитель начальных классов, организатор детских мероприятий',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=anna&style=bear',
    location: 'Москва',
    skills: ['Образование', 'Работа с детьми', 'Организация', 'Иностранные языки'],
    friends: ['user-5'],
    friendRequests: {
      sent: ['user-2'],
      received: []
    },
    stats: {
      tasksCompleted: 35,
      hoursVolunteered: 140,
      rating: 5.0
    },
    invitations: []
  },
  {
    id: 'user-7',
    name: 'Игорь Смирнов',
    email: 'igor.smirnov@example.com',
    role: 'volunteer',
    bio: 'Строитель, мастер на все руки',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=igor&style=bear',
    location: 'Москва',
    skills: ['Строительство', 'Ремонт', 'Инженерия', 'Водительство'],
    friends: ['user-2', 'user-5'],
    friendRequests: {
      sent: [],
      received: ['user-12']
    },
    stats: {
      tasksCompleted: 18,
      hoursVolunteered: 72,
      rating: 4.5
    },
    invitations: []
  },
  {
    id: 'user-8',
    name: 'Ольга Новикова',
    email: 'olga.novikova@example.com',
    role: 'volunteer',
    bio: 'Маркетолог, люблю организовывать мероприятия',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=olga&style=bear',
    location: 'Москва',
    skills: ['Маркетинг', 'Event-менеджмент', 'PR', 'Копирайтинг'],
    friends: ['user-9'],
    friendRequests: {
      sent: ['user-2'],
      received: []
    },
    stats: {
      tasksCompleted: 22,
      hoursVolunteered: 88,
      rating: 4.7
    },
    invitations: []
  },
  {
    id: 'user-9',
    name: 'Павел Громов',
    email: 'pavel.gromov@example.com',
    role: 'volunteer',
    bio: 'Юрист, консультант по правовым вопросам',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=pavel&style=bear',
    location: 'Москва',
    skills: ['Юриспруденция', 'Консалтинг', 'Документоведение'],
    friends: ['user-8'],
    friendRequests: {
      sent: ['user-3'],
      received: []
    },
    stats: {
      tasksCompleted: 14,
      hoursVolunteered: 56,
      rating: 4.4
    },
    invitations: []
  },
  {
    id: 'user-10',
    name: 'Татьяна Лебедева',
    email: 'tatiana.lebedeva@example.com',
    role: 'volunteer',
    bio: 'Повар, организатор благотворительных обедов',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=tatiana&style=bear',
    location: 'Москва',
    skills: ['Кулинария', 'Организация питания', 'Логистика', 'Работа с продуктами'],
    friends: ['user-4'],
    friendRequests: {
      sent: ['user-11'],
      received: []
    },
    stats: {
      tasksCompleted: 30,
      hoursVolunteered: 120,
      rating: 4.8
    },
    invitations: []
  },
  {
    id: 'user-11',
    name: 'Сергей Королев',
    email: 'sergey.korolev@example.com',
    role: 'volunteer',
    bio: 'Водитель, логист, люблю путешествия',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=sergey&style=bear',
    location: 'Москва',
    skills: ['Водительство', 'Логистика', 'Международные перевозки', 'Навигация'],
    friends: ['user-6'],
    friendRequests: {
      sent: ['user-12'],
      received: []
    },
    stats: {
      tasksCompleted: 16,
      hoursVolunteered: 64,
      rating: 4.3
    },
    invitations: []
  },
  {
    id: 'user-12',
    name: 'Наталья Морозова',
    email: 'natalia.morozova@example.com',
    role: 'volunteer',
    bio: 'Бухгалтер, финансовый консультант',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=natalia&style=bear',
    location: 'Москва',
    skills: ['Бухгалтерия', 'Финансы', 'Аудит', 'Excel', '1С'],
    friends: ['user-7', 'user-11'],
    friendRequests: {
      sent: [],
      received: []
    },
    stats: {
      tasksCompleted: 11,
      hoursVolunteered: 44,
      rating: 4.6
    },
    invitations: []
  }
];

// Demo Tasks Database
export const DEMO_TASKS: DemoTask[] = [
  {
    id: 'task-1',
    title: 'Экологическая суббота в Парке Горького',
    description: 'Помощь в уборке парка, высадка новых деревьев и создание комфортной зоны отдыха для горожан. Будем работать вместе с местными жителями для улучшения городской среды.',
    location: 'Парк Горького, Москва',
    startTime: '10:00',
    requiredVolunteers: 15,
    skills: ['Экология', 'Организация', 'Физическая работа'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 5,
    invitedFriends: []
  },
  {
    id: 'task-2',
    title: 'Помощь в приюте для животных',
    description: 'Уход за бездомными животными, уборка вольеров, подготовка корма, прогулки с собаками. Требуются ответственные и любящие животных люди.',
    location: 'Приют "Дружелюбный", Москва',
    startTime: '09:00',
    requiredVolunteers: 8,
    skills: ['Ветеринария', 'Уход за животными', 'Ответственность'],
    urgency: 'high',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 3,
    invitedFriends: []
  },
  {
    id: 'task-3',
    title: 'Фестиваль детского творчества',
    description: 'Организация творческих мастер-классов для детей, помощь в проведении конкурсов и игр. Нужны креативные и терпеливые волонтеры.',
    location: 'ВДЦ "Измайлово", Москва',
    startTime: '12:00',
    requiredVolunteers: 20,
    skills: ['Работа с детьми', 'Творчество', 'Организация мероприятий'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 8,
    invitedFriends: []
  },
  {
    id: 'task-4',
    title: 'Раздача горячих обедов нуждающимся',
    description: 'Приготовка и раздача горячих обедов для малоимущих и бездомных. Требуется помощь в готовке, упаковке и раздаче пищи.',
    location: 'Центр социального обслуживания "Надежда", Москва',
    startTime: '08:00',
    requiredVolunteers: 10,
    skills: ['Кулинария', 'Работа с продуктами', 'Социальная работа'],
    urgency: 'high',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 4,
    invitedFriends: []
  },
  {
    id: 'task-5',
    title: 'Спортивный турнир для молодежи',
    description: 'Организация и проведение спортивных соревнований по футболу и баскетболу для подростков из малообеспеченных семей.',
    location: 'Спортивный комплекс "Олимпийский", Москва',
    startTime: '14:00',
    requiredVolunteers: 12,
    skills: ['Спорт', 'Тренерство', 'Работа с молодежью'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 6,
    invitedFriends: []
  },
  {
    id: 'task-6',
    title: 'Ремонт школьного двора',
    description: 'Благоустройство школьного двора: покраска скамеек, ремонт игрового оборудования, озеленение территории.',
    location: 'Школа №123, Москва',
    startTime: '10:00',
    requiredVolunteers: 6,
    skills: ['Строительство', 'Ремонт', 'Благоустройство'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: false,
    maxFriends: 2,
    invitedFriends: []
  },
  {
    id: 'task-7',
    title: 'Концерт для пенсионеров',
    description: 'Организация музыкального концерта для жителей домов престарелых. Помощь в транспортировке, размещении и обслуживании гостей.',
    location: 'Дом престарелых "Ветеран", Москва',
    startTime: '15:00',
    requiredVolunteers: 8,
    skills: ['Музыка', 'Организация мероприятий', 'Работа с пожилыми'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 4,
    invitedFriends: []
  },
  {
    id: 'task-8',
    title: 'Ярмарка handmade изделий',
    description: 'Организация ярмарки-продажи изделий ручной работы для поддержки мастеров и сбора средств на благотворительность.',
    location: 'ТЦ "Европейский", Москва',
    startTime: '11:00',
    requiredVolunteers: 15,
    skills: ['Продажи', 'Маркетинг', 'Организация'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 7,
    invitedFriends: []
  }
];

// Demo Invitations Database
export const DEMO_INVITATIONS: VolunteerInvitation[] = [
  {
    id: 'inv-1',
    task_id: 'task-1',
    taskTitle: 'Экологическая суббота в Парке Горького',
    inviterId: 'user-1',
    inviterName: 'Александр Петров',
    inviteeId: 'user-2',
    inviteeName: 'Мария Соколова',
    message: 'Привет! Приглашаю тебя на экологическую субботу. Будет здорово поработать вместе!',
    status: 'pending',
    createdAt: new Date('2024-03-30T10:00:00Z'),
    respondedAt: null
  },
  {
    id: 'inv-2',
    task_id: 'task-2',
    taskTitle: 'Помощь в приюте для животных',
    inviterId: 'user-3',
    inviterName: 'Дмитрий Иванов',
    inviteeId: 'user-4',
    inviteeName: 'Елена Козлова',
    message: 'Привет! Знаю, ты любишь животных. Приглашаю помочь в приюте в выходные!',
    status: 'accepted',
    createdAt: new Date('2024-03-29T15:30:00Z'),
    respondedAt: new Date('2024-03-29T18:45:00Z')
  },
  {
    id: 'inv-3',
    task_id: 'task-3',
    taskTitle: 'Фестиваль детского творчества',
    inviterId: 'user-2',
    inviterName: 'Мария Соколова',
    inviteeId: 'user-5',
    inviteeName: 'Михаил Волков',
    message: 'Привет! Приглашаю на фестиваль - дети будут в восторге от твоего внимания!',
    status: 'pending',
    createdAt: new Date('2024-03-30T12:00:00Z'),
    respondedAt: null
  }
];

// Demo Database Manager
export class DemoDatabase {
  private static instance: DemoDatabase;
  private initialized = false;

  private constructor() {}

  static getInstance(): DemoDatabase {
    if (!DemoDatabase.instance) {
      DemoDatabase.instance = new DemoDatabase();
    }
    return DemoDatabase.instance;
  }

  initialize(): void {
    if (this.initialized) return;
    
    // Initialize localStorage with demo data if empty
    if (!localStorage.getItem('demo-users')) {
      localStorage.setItem('demo-users', JSON.stringify(DEMO_USERS));
    }
    
    if (!localStorage.getItem('demo-tasks')) {
      localStorage.setItem('demo-tasks', JSON.stringify(DEMO_TASKS));
    }
    
    if (!localStorage.getItem('demo-invitations')) {
      localStorage.setItem('demo-invitations', JSON.stringify(DEMO_INVITATIONS));
    }
    
    this.initialized = true;
  }

  // User Management
  getUsers(): DemoProfile[] {
    const users = localStorage.getItem('demo-users');
    return users ? JSON.parse(users) : DEMO_USERS;
  }

  getUserById(id: string): DemoProfile | null {
    const users = this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  updateUser(id: string, updates: Partial<DemoProfile>): void {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('demo-users', JSON.stringify(users));
    }
  }

  // Task Management
  getTasks(): DemoTask[] {
    const tasks = localStorage.getItem('demo-tasks');
    return tasks ? JSON.parse(tasks) : DEMO_TASKS;
  }

  getTaskById(id: string): DemoTask | null {
    const tasks = this.getTasks();
    return tasks.find(task => task.id === id) || null;
  }

  updateTask(id: string, updates: Partial<DemoTask>): void {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
      localStorage.setItem('demo-tasks', JSON.stringify(tasks));
    }
  }

  // Friends Management
  sendFriendRequest(fromUserId: string, toUserId: string): void {
    const users = this.getUsers();
    const fromUser = users.find(u => u.id === fromUserId);
    const toUser = users.find(u => u.id === toUserId);
    
    if (fromUser && toUser) {
      // Add to sent requests
      fromUser.friendRequests.sent.push(toUserId);
      
      // Add to received requests
      toUser.friendRequests.received.push(fromUserId);
      
      this.updateUser(fromUserId, { friendRequests: fromUser.friendRequests });
      this.updateUser(toUserId, { friendRequests: toUser.friendRequests });
    }
  }

  acceptFriendRequest(userId: string, requesterId: string): void {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    const requester = users.find(u => u.id === requesterId);
    
    if (user && requester) {
      // Remove from received requests
      user.friendRequests.received = user.friendRequests.received.filter(id => id !== requesterId);
      
      // Add to friends list
      user.friends.push(requesterId);
      requester.friends.push(userId);
      
      this.updateUser(userId, { friendRequests: user.friendRequests, friends: user.friends });
      this.updateUser(requesterId, { friends: requester.friends });
    }
  }

  rejectFriendRequest(userId: string, requesterId: string): void {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
      // Remove from received requests
      user.friendRequests.received = user.friendRequests.received.filter(id => id !== requesterId);
      this.updateUser(userId, { friendRequests: user.friendRequests });
    }
  }

  // Invitations Management
  createInvitation(taskId: string, inviterId: string, inviteeId: string, message: string): VolunteerInvitation {
    const invitation: VolunteerInvitation = {
      id: `inv-${Date.now()}`,
      task_id: taskId,
      taskTitle: this.getTaskById(taskId)?.title || '',
      inviterId,
      inviterName: this.getUserById(inviterId)?.name || '',
      inviteeId,
      inviteeName: this.getUserById(inviteeId)?.name || '',
      message,
      status: 'pending',
      createdAt: new Date(),
      respondedAt: null
    };

    const invitations = this.getInvitations();
    invitations.push(invitation);
    localStorage.setItem('demo-invitations', JSON.stringify(invitations));

    return invitation;
  }

  getInvitations(): VolunteerInvitation[] {
    const invitations = localStorage.getItem('demo-invitations');
    return invitations ? JSON.parse(invitations) : DEMO_INVITATIONS;
  }

  getInvitationsForUser(userId: string): VolunteerInvitation[] {
    const invitations = this.getInvitations();
    return invitations.filter(inv => inv.inviteeId === userId);
  }

  getInvitationsForTask(taskId: string): VolunteerInvitation[] {
    const invitations = this.getInvitations();
    return invitations.filter(inv => inv.task_id === taskId);
  }

  respondToInvitation(invitationId: string, status: 'accepted' | 'rejected'): void {
    const invitations = this.getInvitations();
    const invitationIndex = invitations.findIndex(inv => inv.id === invitationId);
    
    if (invitationIndex !== -1) {
      invitations[invitationIndex].status = status;
      invitations[invitationIndex].respondedAt = new Date();
      
      localStorage.setItem('demo-invitations', JSON.stringify(invitations));
      
      // If accepted, add to task's invited friends
      if (status === 'accepted') {
        const invitation = invitations[invitationIndex];
        this.updateTask(invitation.task_id, {
          invitedFriends: [...(this.getTaskById(invitation.task_id)?.invitedFriends || []), invitation.inviteeId]
        });
      }
    }
  }

  // Stats Management
  updateUserStats(userId: string, taskCompleted: boolean): void {
    const user = this.getUserById(userId);
    if (user) {
      const stats = {
        ...user.stats,
        tasksCompleted: user.stats.tasksCompleted + (taskCompleted ? 1 : 0),
        hoursVolunteered: user.stats.hoursVolunteered + (taskCompleted ? 4 : 0)
      };
      
      this.updateUser(userId, { stats });
    }
  }

  // Utility Methods
  clearAllData(): void {
    localStorage.removeItem('demo-users');
    localStorage.removeItem('demo-tasks');
    localStorage.removeItem('demo-invitations');
    localStorage.removeItem('task-chat-');
    // Clear all task chats
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('task-chat-')) {
        localStorage.removeItem(key);
      }
    });
  }

  resetToDefaults(): void {
    this.clearAllData();
    this.initialize();
  }
}

// Export singleton instance
export const demoDatabase = DemoDatabase.getInstance();
