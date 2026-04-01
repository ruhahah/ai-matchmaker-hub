// Простая демо база данных для надежной работы приложения
class DemoDatabase {
  private storageKey = 'ai-matchmaker-demo-data';
  
  constructor() {
    this.initializeData();
  }
  
  private initializeData() {
    if (!localStorage.getItem(this.storageKey)) {
      const initialData = {
        tasks: this.getInitialTasks(),
        profiles: this.getInitialProfiles(),
        applications: []
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }
  
  private getData() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
  }
  
  private saveData(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
  
  // Задачи
  getTasks() {
    return this.getData().tasks || [];
  }
  
  updateTask(id: string, updates: any): any {
    const data = this.getData();
    const index = data.tasks.findIndex((t: any) => t.id === id);
    if (index !== -1) {
      data.tasks[index] = { ...data.tasks[index], ...updates };
      this.saveData(data);
      return data.tasks[index];
    }
    return null;
  }
  
  createTask(taskData: any) {
    const data = this.getData();
    const newTask = {
      id: `task-${Date.now()}`,
      ...taskData,
      created_at: new Date().toISOString(),
      status: 'open'
    };
    data.tasks.push(newTask);
    this.saveData(data);
    return newTask;
  }
  
  // Профили
  getProfiles() {
    return this.getData().profiles || [];
  }
  
  getUsers() {
    return this.getProfiles();
  }
  
  getUserById(id: string) {
    return this.getProfiles().find(p => p.id === id);
  }
  
  // Заявки
  getApplications() {
    return this.getData().applications || [];
  }
  
  createApplication(application: any) {
    const data = this.getData();
    const newApplication = {
      id: `app-${Date.now()}`,
      ...application,
      created_at: new Date().toISOString()
    };
    data.applications.push(newApplication);
    this.saveData(data);
    return newApplication;
  }
  
  // Сброс демо данных (для обновления)
  resetDemoData() {
    localStorage.removeItem(this.storageKey);
    this.initializeData();
  }
  
  // Начальные данные
  private getInitialTasks() {
    return [
      {
        id: 'task-1',
        title: 'Экологическая акция в парке',
        description: 'Помощь в уборке парка Первого Президента, сбор мусора, посадка деревьев',
        skills: ['Экология', 'Организация', 'Работа с командой'],
        location: 'Парк Первого Президента, Астана',
        status: 'open',
        urgency: 'high',
        creatorId: 'org-1',
        requiredVolunteers: 15,
        startTime: '10:00',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'task-2',
        title: 'Помощь в приюте для животных',
        description: 'Уход за животными, кормление, уборка вольеров, прогулки с собаками',
        skills: ['Животные', 'Ветеринария', 'Забота'],
        location: 'Приют "Дружба", Астана',
        status: 'in_progress',
        urgency: 'medium',
        creatorId: 'org-2',
        requiredVolunteers: 8,
        startTime: '14:00',
        created_at: '2024-01-14T14:00:00Z'
      },
      {
        id: 'task-3',
        title: 'Фестиваль детского творчества',
        description: 'Организация мероприятий для детей, помощь в проведении мастер-классов',
        skills: ['Дети', 'Творчество', 'Организация мероприятий'],
        location: 'Дворец школьников, Астана',
        status: 'open',
        urgency: 'low',
        creatorId: 'org-3',
        requiredVolunteers: 12,
        startTime: '11:00',
        created_at: '2024-01-13T11:00:00Z'
      },
      {
        id: 'task-4',
        title: 'Помощь пожилым людям',
        description: 'Доставка продуктов, уборка квартир, чтение книг, социальная поддержка',
        skills: ['Социальная работа', 'Забота', 'Коммуникация'],
        location: 'Центр социального обслуживания, Астана',
        status: 'completed',
        urgency: 'medium',
        creatorId: 'org-1',
        requiredVolunteers: 6,
        startTime: '09:00',
        created_at: '2024-01-12T09:00:00Z'
      },
      {
        id: 'task-5',
        title: 'Спортивный турнир по футболу',
        description: 'Организация турнира, судейство, помощь с инвентарем, обеспечение порядка',
        skills: ['Спорт', 'Организация', 'Футбол'],
        location: 'Стадион "Астана Арена", Астана',
        status: 'open',
        urgency: 'high',
        creatorId: 'org-2',
        requiredVolunteers: 20,
        startTime: '16:00',
        created_at: '2024-01-11T16:00:00Z'
      },
      // Завершенные задачи для аналитики
      {
        id: 'task-completed-1',
        title: 'Субботник в микрорайоне',
        description: 'Уборка территории микрорайона, покраска скамеек, благоустройство двора',
        skills: ['Экология', 'Организация', 'Работа с командой'],
        location: 'Микрорайон "Алматы", Астана',
        status: 'completed',
        urgency: 'medium',
        creatorId: 'org-1',
        requiredVolunteers: 25,
        startTime: '09:00',
        created_at: '2023-12-01T09:00:00Z'
      },
      {
        id: 'task-completed-2',
        title: 'Концерт для ветеранов',
        description: 'Организация концерта для ветеранов ВОВ, помощь с транспортом, угощением',
        skills: ['Организация мероприятий', 'Коммуникация', 'Забота'],
        location: 'Дом Культуры, Астана',
        status: 'completed',
        urgency: 'high',
        creatorId: 'org-3',
        requiredVolunteers: 18,
        startTime: '15:00',
        created_at: '2023-11-15T15:00:00Z'
      },
      {
        id: 'task-completed-3',
        title: 'Помощь в распределении гуманитарной помощи',
        description: 'Сортировка и упаковка одежды, продуктов, распределение нуждающимся',
        skills: ['Организация', 'Логистика', 'Социальная работа'],
        location: 'Центр распределения, Астана',
        status: 'completed',
        urgency: 'high',
        creatorId: 'org-2',
        requiredVolunteers: 30,
        startTime: '10:00',
        created_at: '2023-10-28T10:00:00Z'
      },
      {
        id: 'task-completed-4',
        title: 'Экологический квест для школьников',
        description: 'Проведение экологического квеста, обучение раздельному сбору мусора',
        skills: ['Дети', 'Экология', 'Обучение'],
        location: 'Школа №45, Астана',
        status: 'completed',
        urgency: 'low',
        creatorId: 'org-1',
        requiredVolunteers: 8,
        startTime: '13:00',
        created_at: '2023-10-15T13:00:00Z'
      },
      {
        id: 'task-completed-5',
        title: 'Благотворительная ярмарка',
        description: 'Организация ярмарки, продажа handmade изделий, сбор средств для приюта',
        skills: ['Организация мероприятий', 'Коммуникация', 'Творчество'],
        location: 'Центральная площадь, Астана',
        status: 'completed',
        urgency: 'medium',
        creatorId: 'org-3',
        requiredVolunteers: 15,
        startTime: '11:00',
        created_at: '2023-09-20T11:00:00Z'
      },
      {
        id: 'task-completed-6',
        title: 'Ремонт в детском саду',
        description: 'Покраска стен, ремонт игрушек, благоустройство игровой площадки',
        skills: ['Ремонт', 'Дети', 'Творчество'],
        location: 'Детский сад "Солнышко", Астана',
        status: 'completed',
        urgency: 'medium',
        creatorId: 'org-2',
        requiredVolunteers: 12,
        startTime: '09:00',
        created_at: '2023-09-10T09:00:00Z'
      },
      {
        id: 'task-completed-7',
        title: 'Посадка деревьев в парке',
        description: 'Посадка саженцев, полив, уход за новыми посадками',
        skills: ['Экология', 'Работа с командой', 'Садоводство'],
        location: 'Парк "Жастар", Астана',
        status: 'completed',
        urgency: 'low',
        creatorId: 'org-1',
        requiredVolunteers: 20,
        startTime: '08:00',
        created_at: '2023-08-25T08:00:00Z'
      },
      {
        id: 'task-completed-8',
        title: 'День пожилых людей',
        description: 'Организация праздника, концерты, вручение подарков, чаепитие',
        skills: ['Организация мероприятий', 'Забота', 'Коммуникация'],
        location: 'Дом ветеранов, Астана',
        status: 'completed',
        urgency: 'medium',
        creatorId: 'org-3',
        requiredVolunteers: 10,
        startTime: '14:00',
        created_at: '2023-08-15T14:00:00Z'
      },
      {
        id: 'task-completed-9',
        title: 'Сбор макулатуры',
        description: 'Сбор и сортировка макулатуры, погрузка, доставка на переработку',
        skills: ['Экология', 'Логистика', 'Организация'],
        location: 'Различные районы, Астана',
        status: 'completed',
        urgency: 'low',
        creatorId: 'org-2',
        requiredVolunteers: 35,
        startTime: '10:00',
        created_at: '2023-07-20T10:00:00Z'
      },
      {
        id: 'task-completed-10',
        title: 'Помощь в организации марафона',
        description: 'Раздача воды, помощь на финишной прямой, поддержка бегунов',
        skills: ['Спорт', 'Организация', 'Коммуникация'],
        location: 'Набережная Ишима, Астана',
        status: 'completed',
        urgency: 'high',
        creatorId: 'org-1',
        requiredVolunteers: 40,
        startTime: '07:00',
        created_at: '2023-07-10T07:00:00Z'
      }
    ];
  }
  
  private getInitialProfiles() {
    return [
      {
        id: 'vol-1',
        name: 'Айгуль Смаилова',
        email: 'aigul@example.com',
        role: 'volunteer',
        bio: 'Студентка, люблю помогать людям и животным',
        avatar: '',
        location: 'Астана',
        skills: ['Экология', 'Животные', 'Организация'],
        friends: [],
        friendRequests: { sent: [], received: [] },
        stats: { tasksCompleted: 12, hoursVolunteered: 48, rating: 4.8 },
        invitations: []
      },
      {
        id: 'vol-2',
        name: 'Дмитрий Петров',
        email: 'dmitry@example.com',
        role: 'volunteer',
        bio: 'IT специалист, свободное время посвящаю волонтерству',
        avatar: '',
        location: 'Астана',
        skills: ['IT', 'Программирование', 'Обучение'],
        friends: [],
        friendRequests: { sent: [], received: [] },
        stats: { tasksCompleted: 8, hoursVolunteered: 32, rating: 4.6 },
        invitations: []
      },
      {
        id: 'vol-3',
        name: 'Назира Абдуллина',
        email: 'nazira@example.com',
        role: 'volunteer',
        bio: 'Учительница, работаю с детьми, люблю творчество',
        avatar: '',
        location: 'Астана',
        skills: ['Дети', 'Творчество', 'Обучение'],
        friends: [],
        friendRequests: { sent: [], received: [] },
        stats: { tasksCompleted: 15, hoursVolunteered: 60, rating: 4.9 },
        invitations: []
      },
      {
        id: 'vol-4',
        name: 'Ерлан Нурланов',
        email: 'erlan@example.com',
        role: 'volunteer',
        bio: 'Спортсмен, помогаю организовывать мероприятия',
        avatar: '',
        location: 'Астана',
        skills: ['Спорт', 'Футбол', 'Организация'],
        friends: [],
        friendRequests: { sent: [], received: [] },
        stats: { tasksCompleted: 20, hoursVolunteered: 80, rating: 5.0 },
        invitations: []
      },
      {
        id: 'vol-5',
        name: 'Светлана Козлова',
        email: 'svetlana@example.com',
        role: 'volunteer',
        bio: 'Медсестра, оказываю социальную помощь',
        avatar: '',
        location: 'Астана',
        skills: ['Медицина', 'Социальная работа', 'Забота'],
        friends: [],
        friendRequests: { sent: [], received: [] },
        stats: { tasksCompleted: 18, hoursVolunteered: 72, rating: 4.7 },
        invitations: []
      }
    ];
  }
}

export const demoDatabase = new DemoDatabase();

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
  friendRequests: { sent: string[]; received: string[] };
  stats: { tasksCompleted: number; hoursVolunteered: number; rating: number };
  invitations: string[];
}
