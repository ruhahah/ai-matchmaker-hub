export interface TaskTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultSkills: string[];
  defaultUrgency: 'low' | 'medium' | 'high';
  defaultLocation: string;
  icon: string;
  color: string;
  keywords: string[];
  estimatedDuration: string;
  volunteerCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const taskTemplates: TaskTemplate[] = [
  {
    id: 'eco_cleanup',
    name: 'Эко-субботник',
    category: 'Экология',
    description: 'Организация уборки парка, сбора мусора, посадки деревьев. Помощь в сохранении чистоты окружающей среды.',
    defaultSkills: ['Экология', 'Работа с инструментами', 'Физическая выносливость', 'Организация'],
    defaultUrgency: 'medium',
    defaultLocation: 'Центральный парк, Астана',
    icon: '🌳',
    color: 'green',
    keywords: ['уборка', 'мусор', 'парк', 'дерево', 'экология', 'чистота'],
    estimatedDuration: '3-4 часа',
    volunteerCount: 10,
    difficulty: 'easy'
  },
  {
    id: 'animal_help',
    name: 'Помощь в приюте',
    category: 'Животные',
    description: 'Уход за бездомными животными, выгул собак, кормление, уборка вольеров, помощь в адаптации.',
    defaultSkills: ['Забота о животных', 'Ветеринария', 'Терпение', 'Ответственность'],
    defaultUrgency: 'high',
    defaultLocation: 'Приют для животных, Астана',
    icon: '🐕',
    color: 'orange',
    keywords: ['животные', 'приют', 'собаки', 'кошки', 'кормление', 'выгул'],
    estimatedDuration: '2-3 часа',
    volunteerCount: 5,
    difficulty: 'medium'
  },
  {
    id: 'teaching',
    name: 'Обучение и менторство',
    category: 'Образование',
    description: 'Проведение мастер-классов, помощь с уроками, менторство для школьников, подготовка к экзаменам.',
    defaultSkills: ['Преподавание', 'Педагогика', 'Предметная область', 'Коммуникация'],
    defaultUrgency: 'medium',
    defaultLocation: 'Школа №42, Астана',
    icon: '📚',
    color: 'blue',
    keywords: ['обучение', 'уроки', 'школа', 'репетитор', 'мастер-класс', 'знания'],
    estimatedDuration: '1-2 часа',
    volunteerCount: 3,
    difficulty: 'medium'
  },
  {
    id: 'elderly_care',
    name: 'Забота о пожилых',
    category: 'Социальная помощь',
    description: 'Посещение пожилых людей, помощь по дому, чтение книг, организация досуга, моральная поддержка.',
    defaultSkills: ['Забота', 'Эмпатия', 'Коммуникация', 'Терпение'],
    defaultUrgency: 'high',
    defaultLocation: 'Дом престарелых, Астана',
    icon: '👵',
    color: 'purple',
    keywords: ['пожилые', 'старики', 'забота', 'помощь', 'дом', 'поддержка'],
    estimatedDuration: '2-3 часа',
    volunteerCount: 4,
    difficulty: 'medium'
  },
  {
    id: 'event_organization',
    name: 'Организация мероприятия',
    category: 'Мероприятия',
    description: 'Помощь в организации концертов, фестивалей, конференций. Регистрация участников, навигация, логистика.',
    defaultSkills: ['Организация мероприятий', 'Коммуникация', 'Логистика', 'Стрессоустойчивость'],
    defaultUrgency: 'high',
    defaultLocation: 'Дворец "Казахстан", Астана',
    icon: '🎪',
    color: 'red',
    keywords: ['мероприятие', 'фестиваль', 'концерт', 'организация', 'участники'],
    estimatedDuration: '4-6 часов',
    volunteerCount: 15,
    difficulty: 'hard'
  },
  {
    id: 'sports_event',
    name: 'Спортивное мероприятие',
    category: 'Спорт',
    description: 'Помощь в проведении спортивных соревнований, судейство, организация инвентаря, поддержка участников.',
    defaultSkills: ['Спорт', 'Организация', 'Судейство', 'Первая помощь'],
    defaultUrgency: 'medium',
    defaultLocation: 'Стадион "Астана Арена"',
    icon: '⚽',
    color: 'green',
    keywords: ['спорт', 'соревнование', 'стадион', 'футбол', 'бег', 'судейство'],
    estimatedDuration: '3-5 часов',
    volunteerCount: 8,
    difficulty: 'medium'
  },
  {
    id: 'charity_fundraiser',
    name: 'Благотворительный сбор',
    category: 'Благотворительность',
    description: 'Организация сбора пожертвований, помощь в упаковке гуманитарной помощи, доставка нуждающимся.',
    defaultSkills: ['Коммуникация', 'Организация', 'Логистика', 'Эмпатия'],
    defaultUrgency: 'high',
    defaultLocation: 'Благотворительный фонд, Астана',
    icon: '💝',
    color: 'pink',
    keywords: ['благотворительность', 'помощь', 'сбор', 'пожертвования', 'гуманитарка'],
    estimatedDuration: '4-5 часов',
    volunteerCount: 12,
    difficulty: 'medium'
  },
  {
    id: 'art_culture',
    name: 'Искусство и культура',
    category: 'Культура',
    description: 'Помощь в выставках, музеях, театрах. Экскурсии, мастер-классы по искусству, культурные мероприятия.',
    defaultSkills: ['Искусство', 'Культура', 'Экскурсовод', 'Творчество'],
    defaultUrgency: 'low',
    defaultLocation: 'Музей современного искусства, Астана',
    icon: '🎨',
    color: 'indigo',
    keywords: ['искусство', 'музей', 'выставка', 'театр', 'культура', 'творчество'],
    estimatedDuration: '2-4 часа',
    volunteerCount: 6,
    difficulty: 'easy'
  },
  {
    id: 'tech_help',
    name: 'Техническая помощь',
    category: 'Технологии',
    description: 'Помощь с компьютерами, настройка ПО, обучение цифровым навыкам, IT-поддержка для пожилых.',
    defaultSkills: ['IT', 'Компьютеры', 'Обучение', 'Техническая поддержка'],
    defaultUrgency: 'medium',
    defaultLocation: 'IT-центр, Астана',
    icon: '💻',
    color: 'cyan',
    keywords: ['компьютер', 'техника', 'IT', 'настройка', 'цифровые навыки'],
    estimatedDuration: '1-2 часа',
    volunteerCount: 4,
    difficulty: 'medium'
  },
  {
    id: 'medical_help',
    name: 'Медицинская помощь',
    category: 'Здравоохранение',
    description: 'Помощь в медпунктах, измерение давления, первая помощь, сопровождение к врачам, профилактические акции.',
    defaultSkills: ['Медицина', 'Первая помощь', 'Забота', 'Ответственность'],
    defaultUrgency: 'high',
    defaultLocation: 'Поликлиника №5, Астана',
    icon: '🏥',
    color: 'red',
    keywords: ['медицина', 'здоровье', 'больница', 'помощь', 'доктор'],
    estimatedDuration: '3-4 часа',
    volunteerCount: 6,
    difficulty: 'hard'
  }
];

// Функция для поиска подходящего шаблона по тексту
export function findTemplateByKeywords(text: string): TaskTemplate | null {
  const keywords = text.toLowerCase().split(' ');
  
  // Подсчет совпадений для каждого шаблона
  const templateScores = taskTemplates.map(template => {
    const matches = template.keywords.filter(keyword => 
      keywords.some(word => word.includes(keyword) || keyword.includes(word))
    ).length;
    
    return { template, score: matches };
  });
  
  // Находим шаблон с максимальным количеством совпадений
  const bestMatch = templateScores.sort((a, b) => b.score - a.score)[0];
  
  return bestMatch.score > 0 ? bestMatch.template : null;
}

// Функция для получения шаблона по ID
export function getTemplateById(id: string): TaskTemplate | null {
  return taskTemplates.find(template => template.id === id) || null;
}

// Функция для получения шаблонов по категории
export function getTemplatesByCategory(category: string): TaskTemplate[] {
  return taskTemplates.filter(template => template.category === category);
}

// Все доступные категории
export const templateCategories = [
  'Экология',
  'Животные',
  'Образование',
  'Социальная помощь',
  'Мероприятия',
  'Спорт',
  'Благотворительность',
  'Культура',
  'Технологии',
  'Здравоохранение'
];
