// Демо-данные для видео демонстрации
import { Profile, Task } from './mockApi';

// Тестовые волонтеры с верификацией Vision API
export const demoVolunteers: Profile[] = [
  {
    id: 'vol-1',
    name: 'Айгуль Мухамедова',
    avatar: '/avatars/aigul.jpg',
    skills: ['Организация мероприятий', 'Работа с детьми', 'Первая помощь', 'Коммуникация'],
    bio: 'Опытный волонтер с 5-летним стажем. Люблю помогать людям и организовывать благотворительные акции.',
    role: 'volunteer'
  },
  {
    id: 'vol-2', 
    name: 'Дмитрий Петров',
    avatar: '/avatars/dmitry.jpg',
    skills: ['IT-поддержка', 'Программирование', 'Обучение', 'Английский язык'],
    bio: 'IT-специалист, готов помогать с техническими задачами и обучать компьютерной грамотности.',
    role: 'volunteer'
  },
  {
    id: 'vol-3',
    name: 'Мария Касымова',
    avatar: '/avatars/maria.jpg',
    skills: ['Экология', 'Ландшафтный дизайн', 'Работа с растениями', 'Организация'],
    bio: 'Эколог и ландшафтный дизайнер. Увлекаюсь озеленением города и экологическими проектами.',
    role: 'volunteer'
  },
  {
    id: 'vol-4',
    name: 'Нурлан Бекенов',
    avatar: '/avatars/nurlan.jpg',
    skills: ['Строительство', 'Ремонт', 'Инженерия', 'Работа с инструментами'],
    bio: 'Профессиональный строитель. Готов помогать с ремонтом и строительными работами для благотворительности.',
    role: 'volunteer'
  },
  {
    id: 'vol-5',
    name: 'Светлана Вольская',
    avatar: '/avatars/svetlana.jpg',
    skills: ['Медицина', 'Психология', 'Социальная работа', 'Консультирование'],
    bio: 'Медицинский работник и психолог. Оказываю поддержку людям в трудных ситуациях.',
    role: 'volunteer'
  }
];

// Тестовые задачи для демонстрации
export const demoTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Экологическая акция "Чистый парк"',
    description: 'Помощь в уборке и благоустройстве Центрального парка Астаны. Необходимо собрать мусор, посадить новые деревья и установить скамейки.',
    skills: ['Экология', 'Физическая работа', 'Организация'],
    location: 'Центральный парк, Астана',
    status: 'open',
    creatorId: 'org-1',
    urgency: 'high',
    requiredVolunteers: 15,
    startTime: '2026-04-05T09:00:00',
    created_at: '2026-04-01T10:00:00'
  },
  {
    id: 'task-2',
    title: 'Помощь в приюте для животных',
    description: 'Требуется помощь в уходе за животными, уборке помещений, кормлении и прогулке собак. Также нужна помощь в организации мероприятия по поиску хозяев.',
    skills: ['Работа с животными', 'Уход', 'Организация мероприятий'],
    location: 'Приют для животных "Дружба", Астана',
    status: 'in_progress',
    creatorId: 'org-2',
    urgency: 'medium',
    requiredVolunteers: 8,
    startTime: '2026-04-03T14:00:00',
    created_at: '2026-03-30T15:00:00'
  },
  {
    id: 'task-3',
    title: 'IT-мастер класс для пенсионеров',
    description: 'Проведение мастер-класса по основам компьютерной грамотности для пожилых людей. Нужно научить пользоваться смартфоном, интернетом и мессенджерами.',
    skills: ['IT-поддержка', 'Обучение', 'Коммуникация', 'Терпение'],
    location: 'Дом пенсионеров "Ясность", Астана',
    status: 'open',
    creatorId: 'org-3',
    urgency: 'medium',
    requiredVolunteers: 3,
    startTime: '2026-04-07T16:00:00',
    created_at: '2026-04-01T12:00:00'
  },
  {
    id: 'task-4',
    title: 'Ремонт детской площадки',
    description: 'Ремонт и покраска детской площадки в жилом комплексе. Нужно починить качели, горки и установить новое игровое оборудование.',
    skills: ['Строительство', 'Ремонт', 'Работа с инструментами', 'Дизайн'],
    location: 'ЖК "Солнечный", Астана',
    status: 'open',
    creatorId: 'org-4',
    urgency: 'high',
    requiredVolunteers: 6,
    startTime: '2026-04-04T10:00:00',
    created_at: '2026-04-01T09:00:00'
  },
  {
    id: 'task-5',
    title: 'Фестиваль "Дети будущего"',
    description: 'Помощь в организации детского фестиваля с конкурсами, играми и мастер-классами. Нужны волонтеры для работы с детьми и организации мероприятий.',
    skills: ['Работа с детьми', 'Организация мероприятий', 'Творчество', 'Анимация'],
    location: 'Дворец школьников, Астана',
    status: 'completed',
    creatorId: 'org-5',
    urgency: 'low',
    requiredVolunteers: 20,
    startTime: '2026-03-28T11:00:00',
    created_at: '2026-03-20T14:00:00'
  }
];

// Демо-данные для Vision API верификации
export const demoVisionResults = [
  {
    taskId: 'task-1',
    photoBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A',
    status: 'approved' as const,
    confidence: 0.95,
    reason: 'Фото подтверждает выполнение работ по уборке парка. Видно собранные мешки с мусором и чистая территория. Задача выполнена качественно.'
  },
  {
    taskId: 'task-2',
    photoBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A',
    status: 'approved' as const,
    confidence: 0.88,
    reason: 'На фото виден ухоженный вольер с чистой водой и кормом. Животное выглядит здоровым и довольным. Условия в приюте соответствуют нормам.'
  }
];

// Демо-данные для приглашения друзей
export const demoFriendInvitations = [
  {
    id: 'invite-1',
    taskId: 'task-1',
    inviterName: 'Айгуль Мухамедова',
    inviterId: 'vol-1',
    message: 'Привет! Ищу помощников для экологической акции в парке. Будет весело и полезно! Присоединяйся!',
    timestamp: '2026-04-01T15:30:00',
    status: 'pending' as const
  },
  {
    id: 'invite-2',
    taskId: 'task-3',
    inviterName: 'Дмитрий Петров',
    inviterId: 'vol-2',
    message: 'Нужна помощь в проведении IT-урока для пенсионеров. Если умеешь работать с компьютерами - присоединяйся!',
    timestamp: '2026-04-01T16:45:00',
    status: 'accepted' as const
  },
  {
    id: 'invite-3',
    taskId: 'task-4',
    inviterName: 'Нурлан Бекенов',
    inviterId: 'vol-4',
    message: 'Ремонтируем детскую площадку в ЖК "Солнечный". Нужны руки мастера! Есть опыт в строительстве?',
    timestamp: '2026-04-01T14:20:00',
    status: 'pending' as const
  }
];

// Функция для инициализации демо-данных
export function initializeDemoData() {
  // Сохраняем волонтеров в localStorage
  localStorage.setItem('demo_volunteers', JSON.stringify(demoVolunteers));
  
  // Сохраняем задачи в localStorage
  localStorage.setItem('demo_tasks', JSON.stringify(demoTasks));
  
  // Сохраняем результаты верификации
  localStorage.setItem('demo_vision_results', JSON.stringify(demoVisionResults));
  
  // Сохраняем приглашения друзей
  localStorage.setItem('demo_friend_invitations', JSON.stringify(demoFriendInvitations));
  
  console.log('Демо-данные инициализированы для видео демонстрации');
}

// Функция для получения демо-данных
export function getDemoVolunteers(): Profile[] {
  const stored = localStorage.getItem('demo_volunteers');
  return stored ? JSON.parse(stored) : demoVolunteers;
}

export function getDemoTasks(): Task[] {
  const stored = localStorage.getItem('demo_tasks');
  return stored ? JSON.parse(stored) : demoTasks;
}

export function getDemoVisionResults() {
  const stored = localStorage.getItem('demo_vision_results');
  return stored ? JSON.parse(stored) : demoVisionResults;
}

export function getDemoFriendInvitations() {
  const stored = localStorage.getItem('demo_friend_invitations');
  return stored ? JSON.parse(stored) : demoFriendInvitations;
}
