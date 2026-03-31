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
    location: 'Астана',
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
    location: 'Астана',
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
    location: 'Астана',
    skills: ['IT', 'Спорт', 'Тренировки', 'Переводы'],
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
    location: 'Астана',
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
    location: 'Астана',
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
    location: 'Астана',
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
    location: 'Астана',
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
    location: 'Астана',
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
    location: 'Астана',
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
    location: 'Астана',
    skills: ['Кулинария', 'Организация питания', 'Логистика', 'Работа с продуктами'],
    friends: ['user-4', 'user-11'],
    friendRequests: {
      sent: [],
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
    location: 'Астана',
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
    location: 'Астана',
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
  },
  {
    id: 'user-13',
    name: 'Андрей Волков',
    email: 'andrey.volkov@example.com',
    role: 'volunteer',
    bio: 'Программист Python, разработчик AI-систем',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=andrey&style=bear',
    location: 'Астана',
    skills: ['Python', 'Machine Learning', 'Data Science', 'Программирование', 'Математика'],
    friends: ['user-14'],
    friendRequests: {
      sent: [],
      received: ['user-15']
    },
    stats: {
      tasksCompleted: 8,
      hoursVolunteered: 32,
      rating: 4.8
    },
    invitations: []
  },
  {
    id: 'user-14',
    name: 'Елена Смирнова',
    email: 'elena.smirnova@example.com',
    role: 'volunteer',
    bio: 'Ветеринарный врач, зоозащитница',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=elena&style=bear',
    location: 'Астана',
    skills: ['Ветеринария', 'Уход за животными', 'Биология', 'Медицина', 'Реанимация'],
    friends: ['user-13'],
    friendRequests: {
      sent: ['user-16'],
      received: []
    },
    stats: {
      tasksCompleted: 25,
      hoursVolunteered: 100,
      rating: 4.9
    },
    invitations: []
  },
  {
    id: 'user-15',
    name: 'Михаил Кузнецов',
    email: 'mikhail.kuznetsov@example.com',
    role: 'volunteer',
    bio: 'Фитнес-тренер, нутрициолог',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=mikhail&style=bear',
    location: 'Астана',
    skills: ['Фитнес', 'Тренерство', 'Нутрициология', 'Спортивная медицина', 'Йога'],
    friends: ['user-16', 'user-17'],
    friendRequests: {
      sent: [],
      received: ['user-13']
    },
    stats: {
      tasksCompleted: 18,
      hoursVolunteered: 72,
      rating: 4.7
    },
    invitations: []
  },
  {
    id: 'user-16',
    name: 'Ольга Белова',
    email: 'olga.belova@example.com',
    role: 'volunteer',
    bio: 'Психолог, арт-терапевт',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=olga&style=bear',
    location: 'Астана',
    skills: ['Психология', 'Арт-терапия', 'Работа с детьми', 'Консультирование', 'Креативность'],
    friends: ['user-15', 'user-18'],
    friendRequests: {
      sent: [],
      received: ['user-14']
    },
    stats: {
      tasksCompleted: 14,
      hoursVolunteered: 56,
      rating: 4.6
    },
    invitations: []
  },
  {
    id: 'user-17',
    name: 'Дмитрий Орлов',
    email: 'dmitry.orlov@example.com',
    role: 'volunteer',
    bio: 'Журналист, фотограф',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=dmitry&style=bear',
    location: 'Астана',
    skills: ['Журналистика', 'Фотография', 'Видеосъемка', 'SMM', 'Копирайтинг'],
    friends: ['user-15', 'user-19'],
    friendRequests: {
      sent: ['user-20'],
      received: []
    },
    stats: {
      tasksCompleted: 12,
      hoursVolunteered: 48,
      rating: 4.5
    },
    invitations: []
  },
  {
    id: 'user-18',
    name: 'Анастасия Лебедева',
    email: 'anastasia.lebedeva@example.com',
    role: 'volunteer',
    bio: 'Музыкант, композитор',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=anastasia&style=bear',
    location: 'Астана',
    skills: ['Музыка', 'Композиция', 'Фортепиано', 'Аранжировка', 'Обучение'],
    friends: ['user-16', 'user-19'],
    friendRequests: {
      sent: [],
      received: ['user-21']
    },
    stats: {
      tasksCompleted: 20,
      hoursVolunteered: 80,
      rating: 4.8
    },
    invitations: []
  },
  {
    id: 'user-19',
    name: 'Игорь Петров',
    email: 'igor.petrov@example.com',
    role: 'volunteer',
    bio: 'Строитель, прораб',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=igor&style=bear',
    location: 'Астана',
    skills: ['Строительство', 'Прорабство', 'Ремонт', 'Инженерия', 'Чтение чертежей'],
    friends: ['user-17', 'user-20'],
    friendRequests: {
      sent: [],
      received: []
    },
    stats: {
      tasksCompleted: 22,
      hoursVolunteered: 88,
      rating: 4.4
    },
    invitations: []
  },
  {
    id: 'user-20',
    name: 'Светлана Козлова',
    email: 'svetlana.kozlova@example.com',
    role: 'volunteer',
    bio: 'Повар, кондитер',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=svetlana&style=bear',
    location: 'Астана',
    skills: ['Кулинария', 'Кондитерское дело', 'Организация питания', 'Менеджмент', 'Гигиена'],
    friends: ['user-19'],
    friendRequests: {
      sent: [],
      received: ['user-17']
    },
    stats: {
      tasksCompleted: 16,
      hoursVolunteered: 64,
      rating: 4.7
    },
    invitations: []
  },
  {
    id: 'user-21',
    name: 'Алексей Новиков',
    email: 'aleksey.novikov@example.com',
    role: 'volunteer',
    bio: 'Юрист, адвокат',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=aleksey&style=bear',
    location: 'Астана',
    skills: ['Юриспруденция', 'Адвокатура', 'Договорное право', 'Консультации', 'Документоведение'],
    friends: ['user-22'],
    friendRequests: {
      sent: [],
      received: ['user-18']
    },
    stats: {
      tasksCompleted: 10,
      hoursVolunteered: 40,
      rating: 4.6
    },
    invitations: []
  },
  {
    id: 'user-22',
    name: 'Мария Иванова',
    email: 'maria.ivanova@example.com',
    role: 'volunteer',
    bio: 'Эколог, биолог',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=maria&style=bear',
    location: 'Астана',
    skills: ['Экология', 'Биология', 'Ботаника', 'Научные исследования', 'Полевые работы'],
    friends: ['user-21', 'user-23'],
    friendRequests: {
      sent: ['user-24'],
      received: []
    },
    stats: {
      tasksCompleted: 19,
      hoursVolunteered: 76,
      rating: 4.8
    },
    invitations: []
  },
  {
    id: 'user-23',
    name: 'Николай Соколов',
    email: 'nikolai.sokolov@example.com',
    role: 'volunteer',
    bio: 'IT-специалист, системный администратор',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=nikolai&style=bear',
    location: 'Астана',
    skills: ['IT-поддержка', 'Системное администрирование', 'Сети', 'Безопасность', 'Программирование'],
    friends: ['user-22', 'user-24'],
    friendRequests: {
      sent: [],
      received: ['user-25']
    },
    stats: {
      tasksCompleted: 15,
      hoursVolunteered: 60,
      rating: 4.5
    },
    invitations: []
  },
  {
    id: 'user-24',
    name: 'Виктория Морозова',
    email: 'viktoriya.morozova@example.com',
    role: 'volunteer',
    bio: 'Дизайнер, художник',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=viktoriya&style=bear',
    location: 'Астана',
    skills: ['Дизайн', 'Графический дизайн', 'UI/UX', 'Рисунок', 'Photoshop'],
    friends: ['user-23'],
    friendRequests: {
      sent: [],
      received: ['user-22']
    },
    stats: {
      tasksCompleted: 13,
      hoursVolunteered: 52,
      rating: 4.7
    },
    invitations: []
  },
  {
    id: 'user-25',
    name: 'Роман Громов',
    email: 'roman.gromov@example.com',
    role: 'volunteer',
    bio: 'Спасатель, инструктор по первой помощи',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=roman&style=bear',
    location: 'Астана',
    skills: ['Первая помощь', 'Спасательные работы', 'Медицина', 'Безопасность', 'Обучение'],
    friends: ['user-26'],
    friendRequests: {
      sent: [],
      received: ['user-23']
    },
    stats: {
      tasksCompleted: 21,
      hoursVolunteered: 84,
      rating: 4.9
    },
    invitations: []
  },
  {
    id: 'user-26',
    name: 'Дарья Попова',
    email: 'darya.popova@example.com',
    role: 'volunteer',
    bio: 'Учитель русского языка и литературы',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=darya&style=bear',
    location: 'Астана',
    skills: ['Преподавание', 'Русский язык', 'Литература', 'Работа с детьми', 'Педагогика'],
    friends: ['user-25', 'user-27'],
    friendRequests: {
      sent: [],
      received: []
    },
    stats: {
      tasksCompleted: 17,
      hoursVolunteered: 68,
      rating: 4.6
    },
    invitations: []
  },
  {
    id: 'user-27',
    name: 'Станислав Васильев',
    email: 'stanislav.vasilyev@example.com',
    role: 'volunteer',
    bio: 'Инженер-конструктор',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=stanislav&style=bear',
    location: 'Астана',
    skills: ['Инженерия', 'Конструирование', '3D-моделирование', 'AutoCAD', 'Проектирование'],
    friends: ['user-26', 'user-28'],
    friendRequests: {
      sent: ['user-29'],
      received: []
    },
    stats: {
      tasksCompleted: 11,
      hoursVolunteered: 44,
      rating: 4.4
    },
    invitations: []
  },
  {
    id: 'user-28',
    name: 'Полина Захарова',
    email: 'polina.zakharova@example.com',
    role: 'volunteer',
    bio: 'Маркетолог, SMM-специалист',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=polina&style=bear',
    location: 'Астана',
    skills: ['Маркетинг', 'SMM', 'Контент-маркетинг', 'Аналитика', 'Копирайтинг'],
    friends: ['user-27'],
    friendRequests: {
      sent: [],
      received: ['user-30']
    },
    stats: {
      tasksCompleted: 14,
      hoursVolunteered: 56,
      rating: 4.5
    },
    invitations: []
  },
  {
    id: 'user-29',
    name: 'Тимур Архипов',
    email: 'timur.arkhipov@example.com',
    role: 'volunteer',
    bio: 'Логист, менеджер по транспорту',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=timur&style=bear',
    location: 'Астана',
    skills: ['Логистика', 'Транспорт', 'Управление цепями поставок', 'Водительство', 'Планирование'],
    friends: [],
    friendRequests: {
      sent: [],
      received: ['user-27']
    },
    stats: {
      tasksCompleted: 9,
      hoursVolunteered: 36,
      rating: 4.3
    },
    invitations: []
  },
  {
    id: 'user-30',
    name: 'Ксения Егорова',
    email: 'kseniya.egorova@example.com',
    role: 'volunteer',
    bio: 'Переводчик, лингвист',
    avatar: 'https://api.dicebear.com/7.x/avataaars?seed=kseniya&style=bear',
    location: 'Астана',
    skills: ['Переводы', 'Английский язык', 'Немецкий язык', 'Лингвистика', 'Обучение'],
    friends: ['user-28'],
    friendRequests: {
      sent: [],
      received: ['user-28']
    },
    stats: {
      tasksCompleted: 12,
      hoursVolunteered: 48,
      rating: 4.7
    },
    invitations: []
  }
];

// Demo Tasks Database - Expanded Version
export const DEMO_TASKS: DemoTask[] = [
  {
    id: 'task-1',
    title: 'Экологическая суббота в Парке Горького',
    description: 'Помощь в уборке парка, высадка новых деревьев и создание комфортной зоны отдыха для горожан. Будем работать вместе с местными жителями для улучшения городской среды. Включает сбор мусора, покраску скамеек, благоустройство клумб.',
    location: 'Парк "Астана", Астана',
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
    title: 'Помощь в приюте для животных "Дружелюбный"',
    description: 'Уход за бездомными животными, уборка вольеров, подготовка корма, прогулки с собаками. Требуются ответственные и любящие животных люди. Работа включает чистку клеток, кормление, ветеринарную помощь.',
    location: 'Приют "Дружелюбный", Астана',
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
    title: 'Фестиваль детского творчества "Радуга талантов"',
    description: 'Организация творческих мастер-классов для детей, помощь в проведении конкурсов и игр. Нужны креативные и терпеливые волонтеры. Будем рисовать, лепить, петь и играть с детьми.',
    location: 'ВДЦ "Астана", Астана',
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
    description: 'Приготовка и раздача горячих обедов для малоимущих и бездомных. Требуется помощь в готовке, упаковке и раздаче пищи. Работаем на кухне и в пункте раздачи.',
    location: 'Центр социального обслуживания "Надежда", Астана',
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
    title: 'Спортивный турнир для молодежи "Будущие чемпионы"',
    description: 'Организация и проведение спортивных соревнований по футболу и баскетболу для подростков из малоимущих семей. Помощь в судействе, организации, награждении.',
    location: 'Спортивный комплекс "Олимпийский", Астана',
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
    title: 'Ремонт школьного двора №123',
    description: 'Благоустройство школьного двора: покраска скамеек, ремонт игрового оборудования, озеленение территории. Создаем безопасное и красивое пространство для детей.',
    location: 'Школа №123, Астана',
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
    title: 'Концерт для пенсионеров "Золотая осень"',
    description: 'Организация музыкального концерта для жителей домов престарелых. Помощь в транспортировке, размещении и обслуживании гостей. Будем петь, танцевать и общаться.',
    location: 'Дом престарелых "Ветеран", Астана',
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
    title: 'Ярмарка handmade изделий "Сделано с любовью"',
    description: 'Организация ярмарки-продажи изделий ручной работы для поддержки мастеров и сбора средств на благотворительность. Помощь в расстановке стендов, приеме платежей.',
    location: 'ТЦ "Европейский", Астана',
    startTime: '11:00',
    requiredVolunteers: 15,
    skills: ['Продажи', 'Маркетинг', 'Организация'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 7,
    invitedFriends: []
  },
  {
    id: 'task-9',
    title: 'IT-курс для пенсионеров "Цифровая грамотность"',
    description: 'Обучение пенсионеров основам работы с компьютером, интернетом, смартфонами. Помощь в настройке устройств, ответ на вопросы, создание учебных материалов.',
    location: 'Библиотека им. Ленина, Астана',
    startTime: '14:00',
    requiredVolunteers: 6,
    skills: ['IT', 'Обучение', 'Работа с пожилыми', 'Терпение'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 3,
    invitedFriends: []
  },
  {
    id: 'task-10',
    title: 'Сбор продуктов для продовольственного банка',
    description: 'Организация сбора продуктов в супермаркетах для нуждающихся семей. Помощь в упаковке, сортировке, транспортировке продуктов на склад.',
    location: 'Супермаркет "Пятерочка", Астана',
    startTime: '10:00',
    requiredVolunteers: 12,
    skills: ['Логистика', 'Работа с людьми', 'Организация'],
    urgency: 'high',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 5,
    invitedFriends: []
  },
  {
    id: 'task-11',
    title: 'Благоустройство набережной реки Москвы',
    description: 'Очистка набережной, установка урн, высадка цветов, создание зон отдыха. Помощь в создании комфортной городской среды для всех горожан.',
    location: 'Набережная реки Москвы, Астана',
    startTime: '09:00',
    requiredVolunteers: 25,
    skills: ['Экология', 'Физическая работа', 'Благоустройство'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 10,
    invitedFriends: []
  },
  {
    id: 'task-12',
    title: 'Театральная студия для детей с ОВЗ',
    description: 'Проведение театральных занятий для детей с особенностями развития. Помощь в постановке спектаклей, создании костюмов, организации представлений.',
    location: 'Реабилитационный центр "Росток", Астана',
    startTime: '16:00',
    requiredVolunteers: 8,
    skills: ['Театр', 'Работа с детьми', 'Психология', 'Творчество'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 4,
    invitedFriends: []
  },
  {
    id: 'task-13',
    title: 'Языковой клуб для мигрантов',
    description: 'Проведение разговорных клубов для изучения русского языка. Помощь в организации диалогов, исправлении ошибок, создании дружелюбной атмосферы.',
    location: 'Миграционный центр, Астана',
    startTime: '18:00',
    requiredVolunteers: 10,
    skills: ['Иностранные языки', 'Обучение', 'Коммуникация'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 6,
    invitedFriends: []
  },
  {
    id: 'task-14',
    title: 'Создание мобильной библиотеки',
    description: 'Организация передвижной библиотеки в отдаленных районах. Помощь в подборке книг, оформлении книжного фонда, проведении чтений.',
    location: 'Передвижной библиотечный пункт, Астана',
    startTime: '13:00',
    requiredVolunteers: 7,
    skills: ['Литература', 'Организация', 'Работа с людьми'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: false,
    maxFriends: 3,
    invitedFriends: []
  },
  {
    id: 'task-15',
    title: 'Фотосессия для семей из детских домов',
    description: 'Проведение профессиональных фотосессий для детей-сирот. Помощь в организации, подборе одежды, создании праздничной атмосферы.',
    location: 'Детский дом "Солнышко", Акмолинская область',
    startTime: '11:00',
    requiredVolunteers: 5,
    skills: ['Фотография', 'Работа с детьми', 'Организация'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 3,
    invitedFriends: []
  },
  {
    id: 'task-16',
    title: 'Велопробег "Зеленый маршрут"',
    description: 'Организация экологического велопробега по городским паркам. Помощь в разметке маршрута, регистрации участников, обеспечении безопасности.',
    location: 'Парк "Сокольники", Астана',
    startTime: '08:00',
    requiredVolunteers: 20,
    skills: ['Спорт', 'Организация', 'Экология'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 8,
    invitedFriends: []
  },
  {
    id: 'task-17',
    title: 'Мастерская по ремонту велосипедов',
    description: 'Бесплатный ремонт велосипедов для нуждающихся. Помощь в диагностике, замене деталей, настройке. Обучение основам ремонта.',
    location: 'Велосипедный клуб "Велодрайв", Астана',
    startTime: '10:00',
    requiredVolunteers: 8,
    skills: ['Ремонт', 'Технические навыки', 'Обучение'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: false,
    maxFriends: 4,
    invitedFriends: []
  },
  {
    id: 'task-18',
    title: 'Сортировка вторсырья "Чистая планета"',
    description: 'Сортировка и упаковка вторсырья для переработки. Помощь в обучению людей правилам сортировки, контроле качества.',
    location: 'Перерабатывающий комплекс, Акмолинская область',
    startTime: '09:00',
    requiredVolunteers: 15,
    skills: ['Экология', 'Сортировка', 'Работа с людьми'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 6,
    invitedFriends: []
  },
  {
    id: 'task-19',
    title: 'Кулинарный мастер-класс для подростков',
    description: 'Обучение подростков основам кулинарии и правильного питания. Помощь в подготовке ингредиентов, проведении урока, уборке.',
    location: 'Кулинарная студия "Вкуснятина", Астана',
    startTime: '15:00',
    requiredVolunteers: 6,
    skills: ['Кулинария', 'Обучение', 'Работа с подростками'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 3,
    invitedFriends: []
  },
  {
    id: 'task-20',
    title: 'Помощь в организации городского фестиваля',
    description: 'Различные задачи на городском фестивале: инфостойки, навигация, помощь гостям, уборка территории. Работа в сменах по 4 часа.',
    location: 'Красная площадь, Астана',
    startTime: '12:00',
    requiredVolunteers: 50,
    skills: ['Организация мероприятий', 'Коммуникация', 'Иностранные языки'],
    urgency: 'high',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 15,
    invitedFriends: []
  },
  {
    id: 'task-21',
    title: 'Создание контента для социальных сетей НКО',
    description: 'Создание фото, видео, текстов для социальных сетей благотворительных организаций. Помощь в написании постов, обработке фото.',
    location: 'Удаленно / Офис в Москве',
    startTime: '14:00',
    requiredVolunteers: 8,
    skills: ['SMM', 'Фотография', 'Копирайтинг', 'Видеомонтаж'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: false,
    maxFriends: 3,
    invitedFriends: []
  },
  {
    id: 'task-22',
    title: 'Юридическая консультация для малоимущих',
    description: 'Помощь в организации бесплатных юридических консультаций. Требуются юристы-волонтеры для консультирования по жилищным, семейным вопросам.',
    location: 'Юридический центр "Право", Астана',
    startTime: '10:00',
    requiredVolunteers: 6,
    skills: ['Юриспруденция', 'Консалтинг', 'Социальная работа'],
    urgency: 'high',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: false,
    maxFriends: 2,
    invitedFriends: []
  },
  {
    id: 'task-23',
    title: 'Садовая акция "Зеленый двор"',
    description: 'Озеленение дворов жилых домов: высадка цветов, кустарников, уход за газонами. Создание красивых и уютных дворов для жителей.',
    location: 'Жилой комплекс "Новые Черемушки", Астана',
    startTime: '09:00',
    requiredVolunteers: 12,
    skills: ['Садоводство', 'Ландшафтный дизайн', 'Физическая работа'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 5,
    invitedFriends: []
  },
  {
    id: 'task-24',
    title: 'Музыкальная студия для детей-сирот',
    description: 'Обучение детей игре на музыкальных инструментах, помощь в создании школьного оркестра. Нужны музыканты-волонтеры.',
    location: 'Детский дом "Мечта", Подольск',
    startTime: '16:00',
    requiredVolunteers: 8,
    skills: ['Музыка', 'Обучение', 'Работа с детьми'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 4,
    invitedFriends: []
  },
  {
    id: 'task-25',
    title: 'Помощь в организации марафона "Бег ради добра"',
    description: 'Помощь в организации благотворительного марафона: регистрация, пункты питания, навигация, медицинское обеспечение.',
    location: 'Парк Победы, Астана',
    startTime: '07:00',
    requiredVolunteers: 30,
    skills: ['Спорт', 'Медицина', 'Организация мероприятий'],
    urgency: 'high',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 10,
    invitedFriends: []
  },
  {
    id: 'task-26',
    title: 'IT-курс для пенсионеров "Цифровая грамотность"',
    description: 'Обучение пожилых людей основам работы с компьютером, интернетом и смартфонами. Помощь в освоении социальных сетей, онлайн-банкинга и видеосвязи. Создаем комфортную обучающую среду.',
    location: 'Центр социального обслуживания "Надежда", Астана',
    startTime: '15:00',
    requiredVolunteers: 8,
    skills: ['IT-навыки', 'Педагогика', 'Терпение', 'Коммуникация'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 4,
    invitedFriends: []
  },
  {
    id: 'task-27',
    title: 'Музыкальный концерт в доме престарелых "Золотая осень"',
    description: 'Организация и проведение музыкального концерта для пожилых людей. Помощь в настройке оборудования, сопровождении гостей, создании праздничной атмосферы. Исполнение классических и популярных мелодий.',
    location: 'Дом престарелых "Золотая осень", Санкт-Петербург',
    startTime: '17:00',
    requiredVolunteers: 6,
    skills: ['Музыка', 'Организация мероприятий', 'Работа с пожилыми', 'Эстетика'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 3,
    invitedFriends: []
  },
  {
    id: 'task-28',
    title: 'Ремонт детской площадки в микрорайоне "Солнечный"',
    description: 'Ремонт и обновление детской площадки: покраска игрового оборудования, замена сломанных элементов, установка новых качелей. Создание безопасного пространства для детей.',
    location: 'Микрорайон "Солнечный", Екатеринбург',
    startTime: '09:00',
    requiredVolunteers: 10,
    skills: ['Строительство', 'Ремонт', 'Работа с инструментами', 'Безопасность'],
    urgency: 'high',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 6,
    invitedFriends: []
  },
  {
    id: 'task-29',
    title: 'Кулинарный мастер-класс "Традиции русской кухни"',
    description: 'Проведение кулинарного мастер-класса по приготовлению традиционных русских блюд для детей из малообеспеченных семей. Помощь в подготовке ингредиентов, обучении, организации процесса.',
    location: 'Центр семейного отдыха "Радуга", Казань',
    startTime: '11:00',
    requiredVolunteers: 5,
    skills: ['Кулинария', 'Работа с детьми', 'Организация', 'Креативность'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: false,
    maxFriends: 2,
    invitedFriends: []
  },
  {
    id: 'task-30',
    title: 'Транспортная помощь для людей с ограниченными возможностями',
    description: 'Перевозка людей с ограниченными возможностями на медицинские процедуры, в магазины, на социальные мероприятия. Помощь в посадке, высадке, сопровождении.',
    location: 'Центр реабилитации "Вера", Новосибирск',
    startTime: '08:00',
    requiredVolunteers: 4,
    skills: ['Водительские права', 'Внимательность', 'Эмпатия', 'Пунктуальность'],
    urgency: 'high',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: false,
    maxFriends: 2,
    invitedFriends: []
  },
  {
    id: 'task-31',
    title: 'Арт-терапия для детей с аутизмом "Цветные эмоции"',
    description: 'Проведение занятий по арт-терапии для детей с аутизмом. Помощь в создании творческой атмосферы, работе с материалами, индивидуальном подходе к каждому ребенку.',
    location: 'Центр развития "Гармония", Ростов-на-Дону',
    startTime: '14:00',
    requiredVolunteers: 3,
    skills: ['Психология', 'Творчество', 'Работа с детьми', 'Специальная педагогика'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: false,
    maxFriends: 1,
    invitedFriends: []
  },
  {
    id: 'task-32',
    title: 'Экологический мониторинг реки "Чистая вода"',
    description: 'Сбор проб воды, измерение показателей загрязнения, очистка береговой линии от мусора. Создание отчета об экологическом состоянии водоемов.',
    location: 'Река Ока, Нижний Новгород',
    startTime: '10:00',
    requiredVolunteers: 12,
    skills: ['Экология', 'Научные исследования', 'Физическая работа', 'Аналитика'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 8,
    invitedFriends: []
  },
  {
    id: 'task-33',
    title: 'Юридическая консультация для малоимущих "Правовая защита"',
    description: 'Предоставление бесплатных юридических консультаций по жилищным, семейным, трудовым вопросам. Помощь в заполнении документов, подготовке исков.',
    location: 'Юридический центр "Защита", Самара',
    startTime: '13:00',
    requiredVolunteers: 4,
    skills: ['Юриспруденция', 'Консалтинг', 'Документоведение', 'Коммуникация'],
    urgency: 'high',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: false,
    maxFriends: 2,
    invitedFriends: []
  },
  {
    id: 'task-34',
    title: 'Фотосессия для приемных семей "Счастливые моменты"',
    description: 'Организация и проведение профессиональных фотосессий для приемных семей. Помощь в подготовке, выборе локаций, создании праздничной атмосферы.',
    location: 'Фотостудия "Моменты", Астана',
    startTime: '10:00',
    requiredVolunteers: 6,
    skills: ['Фотография', 'Организация мероприятий', 'Работа с детьми', 'Творчество'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 4,
    invitedFriends: []
  },
  {
    id: 'task-35',
    title: 'Создание мобильного приложения для волонтеров "Добрый друг"',
    description: 'Разработка мобильного приложения для координации волонтерской деятельности. Помощь в программировании, тестировании, дизайне интерфейса.',
    location: 'IT-хаб "Инновации", Астана',
    startTime: '18:00',
    requiredVolunteers: 8,
    skills: ['Программирование', 'UI/UX дизайн', 'Тестирование', 'Аналитика'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 6,
    invitedFriends: []
  },
  {
    id: 'task-36',
    title: 'Садовый день в хосписе "Цветы жизни"',
    description: 'Благоустройство территории хосписа: посадка цветов, уход за садом, создание уютных зон отдыха для пациентов и их родственников. Создание атмосферы жизни и надежды.',
    location: 'Хоспис "Цветы жизни", Санкт-Петербург',
    startTime: '11:00',
    requiredVolunteers: 7,
    skills: ['Садоводство', 'Эмпатия', 'Работа с больными', 'Творчество'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 4,
    invitedFriends: []
  },
  {
    id: 'task-37',
    title: 'Английский язык для детей-сирот "Мир без границ"',
    description: 'Проведение уроков английского языка для детей-сирот. Помощь в изучении основ языка, подготовке к международным программам, культурному обмену.',
    location: 'Детский дом "Радуга", Астана',
    startTime: '16:00',
    requiredVolunteers: 5,
    skills: ['Иностранные языки', 'Педагогика', 'Работа с детьми', 'Культурология'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: false,
    maxFriends: 2,
    invitedFriends: []
  },
  {
    id: 'task-38',
    title: 'Фитнес-марафон "Здоровье нации"',
    description: 'Организация массового фитнес-мероприятия в парке. Проведение тренировок, консультаций по здоровому образу жизни, замеров физических показателей.',
    location: 'Парк Победы, Волгоград',
    startTime: '09:00',
    requiredVolunteers: 15,
    skills: ['Фитнес', 'Тренерство', 'Организация мероприятий', 'Медицинские знания'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 8,
    invitedFriends: []
  },
  {
    id: 'task-39',
    title: 'Театральная студия для детей с особенностями развития "Сцена мечты"',
    description: 'Создание и проведение театральных постановок с участием детей с особенностями развития. Помощь в режиссуре, костюмах, декорациях, репетициях.',
    location: 'Театр юного зрителя, Екатеринбург',
    startTime: '15:00',
    requiredVolunteers: 8,
    skills: ['Театральное искусство', 'Работа с детьми', 'Креативность', 'Педагогика'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 5,
    invitedFriends: []
  },
  {
    id: 'task-40',
    title: 'Донорская акция "Кровь спасает жизни"',
    description: 'Организация дня донора: регистрация доноров, консультации врачей, обеспечение безопасности процесса. Помощь в уходе за донорами после процедуры.',
    location: 'Национальный центр трансфузиологии, Астана',
    startTime: '08:00',
    requiredVolunteers: 10,
    skills: ['Медицинские знания', 'Организация', 'Первая помощь', 'Коммуникация'],
    urgency: 'high',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 6,
    invitedFriends: []
  },
  {
    id: 'task-41',
    title: 'Создание подкаста "Истории добра"',
    description: 'Запись и монтаж подкастов о волонтерских историях, благотворительных проектах. Помощь в интервьюировании, обработке звука, распространении.',
    location: 'Студия "Голос добра", Санкт-Петербург',
    startTime: '14:00',
    requiredVolunteers: 4,
    skills: ['Журналистика', 'Звукорежиссура', 'Интервью', 'SMM'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: false,
    maxFriends: 2,
    invitedFriends: []
  },
  {
    id: 'task-42',
    title: 'Ремонт велосипедов для детей-сирот "Велодрайв"',
    description: 'Ремонт и настройка велосипедов для детей-сирот. Помощь в сборке, покраске, обучении детей правилам дорожного движения.',
    location: 'Детский дом "Надежда", Нижний Новгород',
    startTime: '10:00',
    requiredVolunteers: 6,
    skills: ['Ремонт техники', 'Работа с детьми', 'Обучение', 'Безопасность'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 4,
    invitedFriends: []
  },
  {
    id: 'task-43',
    title: 'Книжный марафон "Книга в каждый дом"',
    description: 'Сбор, сортировка и доставка книг для малоимущих семей и сельских библиотек. Создание передвижных библиотек в отдаленных районах.',
    location: 'Центральная городская библиотека, Казань',
    startTime: '11:00',
    requiredVolunteers: 12,
    skills: ['Организация', 'Логистика', 'Работа с книгами', 'Коммуникация'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 8,
    invitedFriends: []
  },
  {
    id: 'task-44',
    title: 'Семинар по финансовой грамотности "Умные деньги"',
    description: 'Проведение семинара по основам финансовой грамотности для молодежи из неблагополучных семей. Помощь в подготовке материалов, проведении практических занятий.',
    location: 'Центр занятости молодежи, Ростов-на-Дону',
    startTime: '16:00',
    requiredVolunteers: 5,
    skills: ['Финансы', 'Обучение', 'Работа с молодежью', 'Презентации'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: false,
    maxFriends: 2,
    invitedFriends: []
  },
  {
    id: 'task-45',
    title: 'Создание вертикальной фермы в городском квартале',
    description: 'Установка и обслуживание вертикальной фермы для выращивания овощей в городских условиях. Помощь в монтаже, посадке, уходе за растениями.',
    location: 'Общественный центр "Зеленый город", Астана',
    startTime: '10:00',
    requiredVolunteers: 8,
    skills: ['Сельское хозяйство', 'Экология', 'Инженерия', 'Обучение'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 5,
    invitedFriends: []
  },
  {
    id: 'task-46',
    title: 'Мастерская по ремонту одежды "Вторая жизнь"',
    description: 'Организация мастерской по ремонту и переделке одежды для малоимущих семей. Помощь в швейном деле, обучении основам кройки и шитья.',
    location: 'Центр социальных услуг "Тепло", Самара',
    startTime: '13:00',
    requiredVolunteers: 6,
    skills: ['Швейное дело', 'Дизайн одежды', 'Обучение', 'Творчество'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: false,
    maxFriends: 3,
    invitedFriends: []
  },
  {
    id: 'task-47',
    title: 'Спортивные занятия для детей с ДЦП "Движение к мечте"',
    description: 'Проведение адаптированных спортивных занятий для детей с ДЦП. Помощь в разработке упражнений, обеспечении безопасности, мотивации.',
    location: 'Реабилитационный центр "Надежда", Новосибирск',
    startTime: '15:00',
    requiredVolunteers: 4,
    skills: ['Спортивная медицина', 'Работа с детьми', 'Патология', 'Терпение'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: false,
    maxFriends: 2,
    invitedFriends: []
  },
  {
    id: 'task-48',
    title: 'Создание общественной прачечной "Чистота и уют"',
    description: 'Организация и обслуживание общественной прачечной для малоимущих семей. Помощь в обслуживании оборудования, обучении пользованию, поддержании порядка.',
    location: 'Центр социальной помощи "Милосердие", Екатеринбург',
    startTime: '09:00',
    requiredVolunteers: 5,
    skills: ['Обслуживание техники', 'Организация', 'Коммуникация', 'Социальная работа'],
    urgency: 'high',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 3,
    invitedFriends: []
  },
  {
    id: 'task-49',
    title: 'Квест-комната "Путешествие во времени"',
    description: 'Создание и проведение квест-комнаты для детей из детских домов. Помощь в разработке сценария, создании реквизита, проведении игр.',
    location: 'Развлекательный центр "Квест", Волгоград',
    startTime: '14:00',
    requiredVolunteers: 8,
    skills: ['Креативность', 'Работа с детьми', 'Организация игр', 'Актерское мастерство'],
    urgency: 'low',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 5,
    invitedFriends: []
  },
  {
    id: 'task-50',
    title: 'Мониторинг качества воздуха "Чистое дыхание"',
    description: 'Проведение мониторинга качества воздуха в промышленных районах города. Помощь в сборе данных, анализе результатов, подготовке отчетов.',
    location: 'Экологический центр "Зеленый мир", Челябинск',
    startTime: '08:00',
    requiredVolunteers: 10,
    skills: ['Экология', 'Научные исследования', 'Аналитика', 'Безопасность'],
    urgency: 'medium',
    status: 'open',
    creatorId: 'org-1',
    requiresTeam: true,
    maxFriends: 6,
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
