import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Send, 
  Loader2, 
  Sparkles, 
  Plus,
  Calendar,
  MapPin,
  Users,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Edit,
  Save,
  RefreshCw,
  Lightbulb,
  HelpCircle,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Интерфейсы для сгенерированной задачи
interface GeneratedTask {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  duration: string;
  requiredVolunteers: number;
  skills: string[];
  urgency: 'low' | 'medium' | 'high';
  category: string;
  objectives: string[];
  requirements: string[];
  equipment: string[];
  notes: string;
  aiConfidence: number; // 0-100
  aiReasoning: string;
  questionsAsked: string[];
}

// Интерфейс для вопросов AI
interface AIQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'number' | 'multiselect';
  options?: string[];
  required: boolean;
  context: string;
}

// Интерфейс для сессии генерации
interface GenerationSession {
  id: string;
  userInput: string;
  questions: AIQuestion[];
  answers: Record<string, any>;
  currentStep: number;
  totalSteps: number;
  status: 'collecting' | 'generating' | 'completed' | 'error';
}

export default function AITaskCoordinator() {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<GeneratedTask | null>(null);
  const [editingTask, setEditingTask] = useState<GeneratedTask | null>(null);
  const [session, setSession] = useState<GenerationSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Предустановленные категории задач
  const taskCategories = [
    'Экология', 'Образование', 'Социальная помощь', 'Спорт', 'Культура', 
    'Здравоохранение', 'IT и технологии', 'Творчество', 'Строительство', 'Транспорт'
  ];

  // Уровни срочности
  const urgencyLevels = [
    { value: 'low', label: 'Низкая', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Средняя', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Высокая', color: 'bg-red-100 text-red-800' }
  ];

  // Генерация вопросов AI на основе ввода пользователя
  const generateQuestions = (userInput: string): AIQuestion[] => {
    const questions: AIQuestion[] = [];
    
    // Базовые вопросы для любой задачи
    questions.push({
      id: 'category',
      question: 'Какую категорию лучше всего описывает вашу задачу?',
      type: 'select',
      options: taskCategories,
      required: true,
      context: 'Это поможет определить тип задачи и необходимые навыки'
    });

    // Вопросы в зависимости от контекста
    if (userInput.toLowerCase().includes('дети') || userInput.toLowerCase().includes('школа')) {
      questions.push({
        id: 'age_group',
        question: 'Для какой возрастной группы предназначена задача?',
        type: 'select',
        options: ['Дошкольники (3-6 лет)', 'Младшие школьники (7-10 лет)', 'Подростки (11-16 лет)', 'Студенты (17-22 года)', 'Взрослые'],
        required: true,
        context: 'Возрастная группа влияет на требования к волонтерам'
      });
    }

    // Универсальные вопросы
    questions.push({
      id: 'duration',
      question: 'Какова предполагаемая продолжительность задачи?',
      type: 'select',
      options: ['До 2 часов', '2-4 часа', '4-6 часов', 'Полный день (6-8 часов)', 'Несколько дней'],
      required: true,
      context: 'Продолжительность влияет на планирование и привлечение волонтеров'
    });

    questions.push({
      id: 'volunteers_needed',
      question: 'Сколько волонтеров потребуется для выполнения задачи?',
      type: 'number',
      required: true,
      context: 'Количество волонтеров влияет на организацию и координацию'
    });

    questions.push({
      id: 'urgency',
      question: 'Насколько срочно нужно выполнить эту задачу?',
      type: 'select',
      options: ['Низкая (можно запланировать)', 'Средняя (в течение недели)', 'Высокая (в ближайшие дни)', 'Критическая (немедленно)'],
      required: true,
      context: 'Срочность влияет на приоритет и скорость привлечения волонтеров'
    });

    return questions;
  };

  // Генерация задачи на основе ответов
  const generateTask = async (userInput: string, answers: Record<string, any>): Promise<GeneratedTask> => {
    // Имитация AI-генерации задачи
    await new Promise(resolve => setTimeout(resolve, 2000));

    const confidence = Math.floor(Math.random() * 20) + 80; // 80-100% уверенность
    
    const task: GeneratedTask = {
      id: `task-${Date.now()}`,
      title: generateTitle(userInput, answers),
      description: generateDescription(userInput, answers),
      location: answers.location || 'Москва',
      startTime: generateStartTime(answers),
      duration: answers.duration || '2-4 часа',
      requiredVolunteers: parseInt(answers.volunteers_needed) || 5,
      skills: generateSkills(answers),
      urgency: mapUrgency(answers.urgency),
      category: answers.category || 'Социальная помощь',
      objectives: generateObjectives(userInput, answers),
      requirements: generateRequirements(answers),
      equipment: generateEquipment(answers),
      notes: generateNotes(userInput, answers),
      aiConfidence: confidence,
      aiReasoning: generateReasoning(userInput, answers, confidence),
      questionsAsked: Object.keys(answers)
    };

    return task;
  };

  // Вспомогательные функции для генерации
  const generateTitle = (input: string, answers: Record<string, any>): string => {
    const category = answers.category || 'Социальная помощь';
    const keywords = extractKeywords(input);
    
    // Разнообразные шаблоны заголовков в зависимости от контекста
    const titlePatterns = {
      'Экология': [
        `Экологическая акция: ${keywords.action || 'уборка'} ${keywords.location || 'парка'}`,
        `Зеленый патруль: ${keywords.action || 'озеленение'} ${keywords.location || 'территории'}`,
        `Эко-инициатива: ${keywords.action || 'помощь'} природе`,
        `Чистый город: ${keywords.action || 'уборка'} ${keywords.location || 'района'}`
      ],
      'Образование': [
        `Образовательный проект: ${keywords.action || 'помощь'} ${keywords.target || 'школьникам'}`,
        `Знания в дар: ${keywords.action || 'обучение'} ${keywords.target || 'детям'}`,
        `Интеллект-клуб: ${keywords.action || 'занятия'} с ${keywords.target || 'подростками'}`,
        `Академия добра: ${keywords.action || 'репетиторство'} для ${keywords.target || 'нуждающихся'}`
      ],
      'Социальная помощь': [
        `Социальная миссия: ${keywords.action || 'помощь'} ${keywords.target || 'нуждающимся'}`,
        `Доброе сердце: ${keywords.action || 'поддержка'} ${keywords.target || 'пожилых'}`,
        `Милосердие в действии: ${keywords.action || 'забота'} о ${keywords.target || 'беспомощных'}`,
        `Тепло рук: ${keywords.action || 'сопровождение'} ${keywords.target || 'одиноких'}`
      ],
      'Спорт': [
        `Спортивный марафон: ${keywords.action || 'организация'} соревнований`,
        `Активный город: ${keywords.action || 'проведение'} ${keywords.activity || 'тренировок'}`,
        `Здоровый образ жизни: ${keywords.action || 'пропаганда'} спорта`,
        `Фитнес-фестиваль: ${keywords.action || 'организация'} ${keywords.activity || 'занятий'}`
      ],
      'Культура': [
        `Культурный проект: ${keywords.action || 'организация'} ${keywords.activity || 'выставки'}`,
        `Искусство для всех: ${keywords.action || 'проведение'} ${keywords.activity || 'мастер-классов'}`,
        `Творческая мастерская: ${keywords.action || 'создание'} ${keywords.activity || 'произведений'}`,
        `Фестиваль талантов: ${keywords.action || 'показ'} ${keywords.activity || 'перформансов'}`
      ],
      'Здравоохранение': [
        `Медицинский десант: ${keywords.action || 'помощь'} ${keywords.target || 'пациентам'}`,
        `Здоровье нации: ${keywords.action || 'профилактика'} заболеваний`,
        `Скорая помощь: ${keywords.action || 'сопровождение'} ${keywords.target || 'больных'}`,
        `Донорское движение: ${keywords.action || 'сбор'} ${keywords.resource || 'крови'}`
      ],
      'IT и технологии': [
        `Цифровая грамотность: ${keywords.action || 'обучение'} ${keywords.target || 'пожилых'}`,
        `Техно-помощь: ${keywords.action || 'настройка'} ${keywords.equipment || 'компьютеров'}`,
        `Код добра: ${keywords.action || 'разработка'} ${keywords.project || 'сайта'}`,
        `IT-патруль: ${keywords.action || 'ремонт'} ${keywords.equipment || 'техники'}`
      ],
      'Творчество': [
        `Творческая лаборатория: ${keywords.action || 'создание'} ${keywords.activity || 'поделок'}`,
        `Мастерская чудес: ${keywords.action || 'изготовление'} ${keywords.activity || 'продуктов'}`,
        `Арт-терапия: ${keywords.action || 'занятия'} с ${keywords.target || 'детьми'}`,
        `Декор-студия: ${keywords.action || 'украшение'} ${keywords.location || 'помещения'}`
      ],
      'Строительство': [
        `Строительная бригада: ${keywords.action || 'ремонт'} ${keywords.location || 'здания'}`,
        `Дом для всех: ${keywords.action || 'возведение'} ${keywords.structure || 'конструкции'}`,
        `Ремонтная мастерская: ${keywords.action || 'восстановление'} ${keywords.object || 'помещения'}`,
        `Стройка будущего: ${keywords.action || 'создание'} ${keywords.project || 'объекта'}`
      ],
      'Транспорт': [
        `Транспортная помощь: ${keywords.action || 'перевозка'} ${keywords.resource || 'грузов'}`,
        `Безопасная дорога: ${keywords.action || 'сопровождение'} ${keywords.target || 'пассажиров'}`,
        `Мобильный сервис: ${keywords.action || 'доставка'} ${keywords.resource || 'продуктов'}`,
        `Автопатруль: ${keywords.action || 'помощь'} на ${keywords.location || 'дорогах'}`
      ]
    };
    
    const patterns = titlePatterns[category] || titlePatterns['Социальная помощь'];
    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  const extractKeywords = (input: string): Record<string, string> => {
    const keywords: Record<string, string> = {};
    
    // Извлечение ключевых слов из ввода
    const lowerInput = input.toLowerCase();
    
    // Действия
    const actions = ['помощь', 'организация', 'проведение', 'уборка', 'ремонт', 'обучение', 'сопровождение', 'создание', 'разработка', 'настройка', 'перевозка', 'доставка', 'сбор'];
    for (const action of actions) {
      if (lowerInput.includes(action)) {
        keywords.action = action;
        break;
      }
    }
    
    // Целевая аудитория
    const targets = ['дети', 'пожилые', 'животные', 'больные', 'нуждающимся', 'школьникам', 'подросткам', 'студентам', 'инвалидам', 'бездомным'];
    for (const target of targets) {
      if (lowerInput.includes(target)) {
        keywords.target = target;
        break;
      }
    }
    
    // Локации
    const locations = ['парк', 'школа', 'больница', 'приют', 'дом', 'улица', 'район', 'город', 'центр', 'библиотека', 'музей'];
    for (const location of locations) {
      if (lowerInput.includes(location)) {
        keywords.location = location;
        break;
      }
    }
    
    // Активности
    const activities = ['тренировки', 'соревнования', 'концерт', 'выставка', 'мастер-класс', 'лекция', 'семинар', 'фестиваль', 'конференция'];
    for (const activity of activities) {
      if (lowerInput.includes(activity)) {
        keywords.activity = activity;
        break;
      }
    }
    
    // Оборудование
    const equipment = ['компьютеры', 'техника', 'инструменты', 'оборудование', 'продукты', 'кровь', 'грузы'];
    for (const equip of equipment) {
      if (lowerInput.includes(equip)) {
        keywords.equipment = equip;
        break;
      }
    }
    
    // Проекты/объекты
    const projects = ['сайт', 'приложение', 'здание', 'конструкция', 'помещение', 'дорожка', 'клумба', 'мост'];
    for (const project of projects) {
      if (lowerInput.includes(project)) {
        keywords.project = project;
        break;
      }
    }
    
    return keywords;
  };

  const generateDescription = (input: string, answers: Record<string, any>): string => {
    const category = answers.category || 'Социальная помощь';
    const keywords = extractKeywords(input);
    
    // Разнообразные шаблоны описаний для каждой категории
    const descriptionPatterns = {
      'Экология': [
        `Присоединяйтесь к нашей экологической инициативе! Мы ищем активных волонтеров для ${keywords.action || 'уборки'} ${keywords.location || 'парка'}. Вместе мы сможем сделать наш город чище и зеленее. Работа на свежем воздухе, отличная компания и реальная польза для природы.`,
        `Экологическая акция для тех, кто любит природу! Требуется помощь в ${keywords.action || 'озеленении'} ${keywords.location || 'территории'}. Будем сажать деревья, ухаживать за клумбами и создавать комфортные зоны отдыха. Все необходимые инструменты предоставляются.`,
        `Станьте частью зеленого движения! Нужны волонтеры для ${keywords.action || 'помощи'} в уходе за ${keywords.location || 'парком'}. Это отличная возможность внести вклад в экологию города, познакомиться с единомышленниками и провести время с пользой.`
      ],
      'Образование': [
        `Помогите нам в образовательном проекте! Ищем волонтеров для ${keywords.action || 'помощи'} ${keywords.target || 'школьникам'} в учебе. Если у вас есть знания в определенных предметах и желание помочь детям - мы ждем вас! Гибкий график и поддержка наставников.`,
        `Образовательная инициатива для развития подрастающего поколения. Требуются волонтеры для ${keywords.action || 'проведения'} занятий с ${keywords.target || 'подростками'}. Помогите детям раскрыть свой потенциал и получить дополнительные знания.`,
        `Знания в дар - проект, объединяющий тех, кто хочет делиться опытом! Нужны волонтеры для ${keywords.action || 'репетиторства'} ${keywords.target || 'нуждающимся'}. Даже несколько часов в неделю могут кардинально изменить чью-то жизнь.`
      ],
      'Социальная помощь': [
        `Социальная миссия требует вашего участия! Ищем добрых и отзывчивых волонтеров для ${keywords.action || 'помощи'} ${keywords.target || 'нуждающимся'}. Ваша поддержка может стать для кого-то настоящим спасением. Работа в теплой атмосфере с благодарными людьми.`,
        `Присоединяйтесь к нашей команде милосердия! Требуются волонтеры для ${keywords.action || 'сопровождения'} ${keywords.target || 'пожилых'}. Помощь в бытовых вопросах, общение, прогулки - это значит для наших подопечных очень много.`,
        `Тепло рук для тех, кто в нем нуждается. Ищем волонтеров для ${keywords.action || 'заботы'} о ${keywords.target || 'одиноких'}. Даже небольшая помощь может сделать чью-то жизнь светлее и счастливее.`
      ],
      'Спорт': [
        `Спортивный марафон ждет участников! Нужны волонтеры для ${keywords.action || 'организации'} соревнований. Помощь в подготовке, судействе, обслуживании участников. Отличная возможность быть частью спортивного события и поддерживать здоровый образ жизни.`,
        `Активный город - проект для спортивных энтузиастов! Требуются волонтеры для ${keywords.action || 'проведения'} ${keywords.activity || 'тренировок'} с детьми и взрослыми. Если вы любите спорт и хотите делиться своей энергией - присоединяйтесь!`,
        `Фитнес-фестиваль для всех возрастов! Ищем волонтеров для ${keywords.action || 'организации'} ${keywords.activity || 'занятий'}. Помощь в подготовке инвентаря, работе с участниками, создании атмосферы праздника.`
      ],
      'Культура': [
        `Культурный проект требует творческих людей! Нужны волонтеры для ${keywords.action || 'организации'} ${keywords.activity || 'выставки'}. Помощь в подготовке экспозиции, работе с посетителями, проведении экскурсий. Отличная возможность погрузиться в мир искусства.`,
        `Искусство для всех - проект, делающий культуру доступной! Требуются волонтеры для ${keywords.action || 'проведения'} ${keywords.activity || 'мастер-классов'}. Помогайте людям открывать в себе творческие способности и радоваться красоте.`,
        `Фестиваль талантов ждет своих организаторов! Ищем волонтеров для ${keywords.action || 'показа'} ${keywords.activity || 'перформансов'}. Работа с артистами, помощь в подготовке сцены, создание праздничной атмосферы.`
      ],
      'Здравоохранение': [
        `Медицинский десант для тех, кто нуждается в помощи! Ищем волонтеров для ${keywords.action || 'сопровождения'} ${keywords.target || 'пациентов'}. Помощь в передвижении, общении, бытовых вопросах. Ваше участие может значительно улучшить качество жизни больных.`,
        `Здоровье нации - общее дело! Требуются волонтеры для ${keywords.action || 'профилактики'} заболеваний. Помощь в организации медицинских осмотров, просветительской работе, поддержке здорового образа жизни.`,
        `Донорское движение спасает жизни! Нужны волонтеры для ${keywords.action || 'сбора'} ${keywords.resource || 'крови'} и организации донорских акций. Ваша помощь может спасти чью-то жизнь.`
      ],
      'IT и технологии': [
        `Цифровая грамотность для всех возрастов! Ищем волонтеров для ${keywords.action || 'обучения'} ${keywords.target || 'пожилых'} работе с компьютером. Помогите старшему поколению освоить современные технологии и оставаться на связи с близкими.`,
        `Техно-помощь для тех, кто в ней нуждается! Требуются волонтеры для ${keywords.action || 'настройки'} ${keywords.equipment || 'компьютеров'} для незащищенных слоев населения. Ваша техническая экспертиза может значительно улучшить чью-то жизнь.`,
        `Код добра - IT-проекты для благотворительности! Нужны волонтеры для ${keywords.action || 'разработки'} ${keywords.project || 'сайта'} для некоммерческих организаций. Помогите делать добро с помощью технологий!`
      ],
      'Творчество': [
        `Творческая лаборатория ждет мастеров! Ищем волонтеров для ${keywords.action || 'создания'} ${keywords.activity || 'поделок'} с детьми. Помогите маленьким талантам раскрыть свои способности и радоваться результатам своего творчества.`,
        `Мастерская чудес для всех желающих! Требуются волонтеры для ${keywords.action || 'изготовления'} ${keywords.activity || 'продуктов'} на благотворительность. Ваше творчество поможет собрать средства на нужды тех, кто попал в трудную ситуацию.`,
        `Арт-терапия через творчество! Нужны волонтеры для ${keywords.action || 'занятий'} с ${keywords.target || 'детьми'} из неблагополучных семей. Помогите детям справиться с трудностями через искусство и самовыражение.`
      ],
      'Строительство': [
        `Строительная бригада для добрых дел! Ищем волонтеров для ${keywords.action || 'ремонта'} ${keywords.location || 'здания'} для нуждающихся семей. Помощь в ремонте жилья, создании комфортных условий жизни. Опыт не требуется - научим всему!`,
        `Дом для всех - проект строительства жилья! Требуются волонтеры для ${keywords.action || 'возведения'} ${keywords.structure || 'конструкций'} для социальных объектов. Ваша помощь поможет создать комфортные условия для многих людей.`,
        `Ремонтная мастерская для тех, кто в ней нуждается! Ищем волонтеров для ${keywords.action || 'восстановления'} ${keywords.object || 'помещения'} в социальных учреждениях. Помогите сделать пространство уютным и функциональным.`
      ],
      'Транспорт': [
        `Транспортная помощь для мобильности! Ищем водителей для ${keywords.action || 'перевозки'} ${keywords.resource || 'грузов'} и людей. Помощь в доставке гуманитарной помощи, перевозке пожилых к врачам. Ваш автомобиль может стать чьей-то надеждой.`,
        `Безопасная дорога для всех пассажиров! Требуются волонтеры для ${keywords.action || 'сопровождения'} ${keywords.target || 'пассажиров'} с ограниченными возможностями. Помощь в передвижении по городу, посещении важных мест.`,
        `Мобильный сервис доставки добра! Нужны волонтеры для ${keywords.action || 'доставки'} ${keywords.resource || 'продуктов'} и товаров одиноким пожилым людям. Ваша помощь обеспечит питанием тех, кто не может выйти из дома.`
      ]
    };
    
    const patterns = descriptionPatterns[category] || descriptionPatterns['Социальная помощь'];
    const baseDescription = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Добавляем детали из ответов пользователя
    const details = generateDetailedDescription(answers);
    
    return `${baseDescription} ${details}`;
  };

  const generateDetailedDescription = (answers: Record<string, any>): string => {
    let desc = '';
    
    if (answers.age_group) {
      desc += `Целевая аудитория: ${answers.age_group}. `;
    }
  }
  
  const locations = categoryLocations[category] || categoryLocations['Социальная помощь'];
  return locations[Math.floor(Math.random() * locations.length)];
};
  const generateSkills = (answers: Record<string, any>): string[] => {
    const category = answers.category || 'Социальная помощь';
    const keywords = extractKeywords(answers.userInput || '');
    
    // Разнообразные наборы навыков для каждой категории
    const categorySkills = {
      'Экология': [
        ['Экология', 'Работа на свежем воздухе', 'Ответственное отношение к природе'],
        ['Уборка территории', 'Садоводство', 'Групповая работа'],
        ['Забота о природе', 'Физическая выносливость', 'Внимательность к деталям'],
        ['Озеленение', 'Работа с инструментами', 'Коммуникабельность']
      ],
      'Образование': [
        ['Педагогика', 'Работа с детьми', 'Терпение'],
        ['Обучение', 'Коммуникативные навыки', 'Предметная экспертиза'],
        ['Менторство', 'Психология', 'Организация времени'],
        ['Репетиторство', 'Методика преподавания', 'Эмпатия']
      ],
      'Социальная помощь': [
        ['Социальная работа', 'Эмпатия', 'Внимательность'],
        ['Психологическая поддержка', 'Терпимость', 'Активное слушание'],
        ['Забота о людях', 'Ответственность', 'Коммуникабельность'],
        ['Помощь нуждающимся', 'Доброжелательность', 'Стрессоустойчивость']
      ],
      'Спорт': [
        ['Спортивная подготовка', 'Работа с командой', 'Лидерство'],
        ['Тренерство', 'Мотивация', 'Организация мероприятий'],
        ['Физическая культура', 'Здоровый образ жизни', 'Коммуникация'],
        ['Спортивные дисциплины', 'Безопасность', 'Первая помощь']
      ],
      'Культура': [
        ['Творческие способности', 'Организация мероприятий', 'Коммуникация'],
        ['Искусство', 'Эстетический вкус', 'Работа с публикой'],
        ['Культурное просвещение', 'Творческое мышление', 'Презентация'],
        ['Художественные навыки', 'Кураторство', 'Межличностные отношения']
      ],
      'Здравоохранение': [
        ['Медицинские знания', 'Первая помощь', 'Спокойствие в экстренных ситуациях'],
        ['Забота о пациентах', 'Гигиена', 'Эмпатия'],
        ['Медицинская этика', 'Внимательность', 'Физическая выносливость'],
        ['Психологическая поддержка', 'Терпение', 'Ответственность']
      ],
      'IT и технологии': [
        ['Компьютерная грамотность', 'Технические навыки', 'Обучение'],
        ['Программирование', 'Решение проблем', 'Коммуникация'],
        ['IT-поддержка', 'Технологическая экспертиза', 'Терпение'],
        ['Цифровые технологии', 'Аналитическое мышление', 'Помощь']
      ],
      'Творчество': [
        ['Художественные навыки', 'Творческое мышление', 'Работа с детьми'],
        ['Ремесло', 'Внимательность к деталям', 'Педагогика'],
        ['Дизайн', 'Фантазия', 'Организация процесса'],
        ['Искусство', 'Эстетика', 'Коммуникабельность']
      ],
      'Строительство': [
        ['Строительные навыки', 'Физическая работа', 'Безопасность'],
        ['Ремонт', 'Работа с инструментами', 'Внимательность'],
        ['Пространственное мышление', 'Физическая выносливость', 'Командная работа'],
        ['Отделочные работы', 'Качество', 'Ответственность']
      ],
      'Транспорт': [
        ['Водительские права', 'Ориентация в городе', 'Ответственность'],
        ['Логистика', 'Планирование маршрутов', 'Коммуникация'],
        ['Транспортная безопасность', 'Внимательность', 'Помощь пассажирам'],
        ['Навигация', 'Время управления', 'Клиентский сервис']
      ]
    };
    
    const skills = categorySkills[category] || categorySkills['Социальная помощь'];
    const selectedSkills = skills[Math.floor(Math.random() * skills.length)];
    
    // Добавляем базовые навыки
    const baseSkills = ['Ответственность', 'Коммуникация'];
    
    // Добавляем контекстуальные навыки на основе ключевых слов
    const contextualSkills: string[] = [];
    
    if (keywords.target === 'дети' || keywords.target === 'школьникам') {
      contextualSkills.push('Работа с детьми', 'Педагогика');
    }
    
    if (keywords.target === 'пожилые') {
      contextualSkills.push('Работа с пожилыми', 'Терпение');
    }
    
    if (keywords.target === 'животные') {
      contextualSkills.push('Уход за животными', 'Ветеринария');
    }
    
    return [...new Set([...selectedSkills, ...baseSkills, ...contextualSkills])];
  };

  const mapUrgency = (urgency: string): 'low' | 'medium' | 'high' => {
    if (urgency?.includes('Критическая') || urgency?.includes('Высокая')) return 'high';
    if (urgency?.includes('Средняя')) return 'medium';
    return 'low';
  };

  const generateObjectives = (input: string, answers: Record<string, any>): string[] => {
    const objectives = [
      `Основная цель: ${extractMainGoal(input)}`,
      'Обеспечение качественного выполнения задачи',
      'Создание комфортных условий для участников'
    ];
    
    if (answers.age_group) {
      objectives.push(`Адаптация под возрастную группу: ${answers.age_group}`);
    }
    
    return objectives;
  };

  const generateRequirements = (answers: Record<string, any>): string[] => {
    const requirements = [
      'Пунктуальность и ответственность',
      'Готовность следовать инструкциям'
    ];
    
    if (answers.age_group && answers.age_group.includes('дети')) {
      requirements.push('Опыт работы с детьми');
    }
    
    return requirements;
  };

  const generateEquipment = (answers: Record<string, any>): string[] => {
    const equipment: string[] = [];
    
    if (answers.equipment) {
      equipment.push(answers.equipment);
    }
    
    if (answers.category?.includes('Спорт')) {
      equipment.push('Спортивная одежда и обувь');
    }
    
    return equipment;
  };

  const generateNotes = (input: string, answers: Record<string, any>): string => {
    return `Задача сгенерирована AI на основе вашего запроса. Уверенность в правильности интерпретации: ${Math.floor(Math.random() * 20) + 80}%.`;
  };

  const generateReasoning = (input: string, answers: Record<string, any>, confidence: number): string => {
    return `AI проанализировал ваш запрос "${input}" и ответы на ${Object.keys(answers).length} уточняющих вопросов. На основе этого была сгенерирована задача с уверенностью ${confidence}%. Ключевые факторы: категория "${answers.category}", срочность "${answers.urgency}", требуемое количество волонтеров: ${answers.volunteers_needed}.`;
  };

  const extractAction = (input: string): string => {
    const actions = ['помощь', 'организация', 'проведение', 'уборка', 'ремонт', 'обучение', 'сопровождение'];
    for (const action of actions) {
      if (input.toLowerCase().includes(action)) {
        return action.charAt(0).toUpperCase() + action.slice(1);
      }
    }
    return 'Помощь';
  };

  const extractMainGoal = (input: string): string => {
    if (input.toLowerCase().includes('помощь')) return 'Оказание помощи';
    if (input.toLowerCase().includes('организовать')) return 'Организация мероприятия';
    if (input.toLowerCase().includes('уборка')) return 'Уборка территории';
    if (input.toLowerCase().includes('ремонт')) return 'Ремонтные работы';
    return 'Выполнение поставленной задачи';
  };

  // Начало процесса генерации
  const startGeneration = async () => {
    if (!input.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите описание задачи',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    // Генерируем вопросы
    const questions = generateQuestions(input);
    
    // Создаем сессию
    const newSession: GenerationSession = {
      id: `session-${Date.now()}`,
      userInput: input,
      questions,
      answers: {},
      currentStep: 0,
      totalSteps: questions.length,
      status: 'collecting'
    };
    
    setSession(newSession);
    
    // Если вопросов нет, сразу генерируем задачу
    if (questions.length === 0) {
      await completeGeneration(newSession);
    }
    
    setIsGenerating(false);
  };

  // Ответ на текущий вопрос
  const answerQuestion = (answer: any) => {
    if (!session) return;
    
    const updatedSession = {
      ...session,
      answers: {
        ...session.answers,
        [session.questions[session.currentStep].id]: answer
      },
      currentStep: session.currentStep + 1
    };
    
    setSession(updatedSession);
    
    // Если все вопросы отвечены, генерируем задачу
    if (updatedSession.currentStep >= updatedSession.totalSteps) {
      completeGeneration(updatedSession);
    }
    
    setCurrentAnswer('');
  };

  // Завершение генерации
  const completeGeneration = async (sessionData: GenerationSession) => {
    setSession({ ...sessionData, status: 'generating' });
    
    try {
      const task = await generateTask(sessionData.userInput, sessionData.answers);
      setGeneratedTasks(prev => [task, ...prev]);
      setSelectedTask(task);
      setSession({ ...sessionData, status: 'completed' });
      
      toast({
        title: 'Задача сгенерирована!',
        description: 'AI создал задачу на основе ваших ответов',
      });
    } catch (error) {
      setSession({ ...sessionData, status: 'error' });
      toast({
        title: 'Ошибка',
        description: 'Не удалось сгенерировать задачу',
        variant: 'destructive',
      });
    }
  };

  // Перезапуск генерации
  const regenerateTask = async (taskIndex: number) => {
    const task = generatedTasks[taskIndex];
    if (!task) return;
    
    setIsGenerating(true);
    
    try {
      const newTask = await generateTask(task.questionsAsked.join(' '), task.questionsAsked.reduce((acc, q) => ({ ...acc, [q]: true }), {}));
      
      setGeneratedTasks(prev => {
        const updated = [...prev];
        updated[taskIndex] = newTask;
        return updated;
      });
      
      toast({
        title: 'Задача перегенерирована',
        description: 'AI создал новую версию задачи',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось перегенерировать задачу',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Сохранение задачи
  const saveTask = (task: GeneratedTask) => {
    // Здесь будет логика сохранения в базу данных
    toast({
      title: 'Задача сохранена',
      description: 'Задача успешно добавлена в систему',
    });
    
    setEditingTask(null);
    setSelectedTask(null);
  };

  // Редактирование задачи
  const handleEditTask = (task: GeneratedTask) => {
    setEditingTask({ ...task });
  };

  // Сохранение отредактированной задачи
  const saveEditedTask = () => {
    if (!editingTask) return;
    
    setGeneratedTasks(prev => 
      prev.map(task => task.id === editingTask.id ? editingTask : task)
    );
    
    toast({
      title: 'Задача обновлена',
      description: 'Изменения сохранены',
    });
    
    setEditingTask(null);
  };

  // Рендеринг текущего вопроса
  const renderQuestion = (question: AIQuestion) => {
    switch (question.type) {
      case 'text':
        return (
          <div className="space-y-3">
            <Textarea
              placeholder="Введите ваш ответ..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="min-h-[100px]"
            />
            <Button onClick={() => answerQuestion(currentAnswer)} disabled={!currentAnswer.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Ответить
            </Button>
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="Введите число..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
            />
            <Button onClick={() => answerQuestion(parseInt(currentAnswer))} disabled={!currentAnswer}>
              <Send className="w-4 h-4 mr-2" />
              Ответить
            </Button>
          </div>
        );
      
      case 'select':
        return (
          <div className="space-y-3">
            <Select onValueChange={(value) => answerQuestion(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите вариант..." />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'multiselect':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {question.options?.map(option => (
                <Button
                  key={option}
                  variant={currentAnswer.includes(option) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const selected = currentAnswer.split(',').filter(Boolean);
                    if (selected.includes(option)) {
                      setCurrentAnswer(selected.filter(s => s !== option).join(','));
                    } else {
                      setCurrentAnswer([...selected, option].join(','));
                    }
                  }}
                >
                  {option}
                </Button>
              ))}
            </div>
            <Button onClick={() => answerQuestion(currentAnswer.split(',').filter(Boolean))}>
              <Send className="w-4 h-4 mr-2" />
              Ответить
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Рендеринг сгенерированной задачи
  const renderTask = (task: GeneratedTask) => {
    const isEditing = editingTask?.id === task.id;
    const urgencyInfo = urgencyLevels.find(u => u.value === task.urgency);
    
    if (isEditing) {
      return (
        <Card className="mb-4 border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Редактирование задачи
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Название задачи</label>
                <Input
                  value={editingTask.title}
                  onChange={(e) => setEditingTask(prev => prev ? {...prev, title: e.target.value} : null)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Описание</label>
                <Textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask(prev => prev ? {...prev, description: e.target.value} : null)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Локация</label>
                  <Input
                    value={editingTask.location}
                    onChange={(e) => setEditingTask(prev => prev ? {...prev, location: e.target.value} : null)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Количество волонтеров</label>
                  <Input
                    type="number"
                    value={editingTask.requiredVolunteers}
                    onChange={(e) => setEditingTask(prev => prev ? {...prev, requiredVolunteers: parseInt(e.target.value) || 1} : null)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={saveEditedTask}>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить изменения
                </Button>
                <Button variant="outline" onClick={() => setEditingTask(null)}>
                  Отмена
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{task.title}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={urgencyInfo?.color}>
                  {urgencyInfo?.label}
                </Badge>
                <Badge variant="outline">{task.category}</Badge>
                <Badge variant="secondary">
                  <Target className="w-3 h-3 mr-1" />
                  {task.aiConfidence}% AI
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => regenerateTask(generatedTasks.indexOf(task))}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleEditTask(task)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => saveTask(task)}>
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Описание</h4>
              <p className="text-gray-600">{task.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{task.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{task.startTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{task.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{task.requiredVolunteers} волонтеров</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Требуемые навыки</h4>
              <div className="flex flex-wrap gap-1">
                {task.skills.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Цели задачи</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {task.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Требования</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {task.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
            
            {task.equipment.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Оборудование</h4>
                <div className="flex flex-wrap gap-1">
                  {task.equipment.map(item => (
                    <Badge key={item} variant="outline">{item}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {showAdvanced && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI Анализ
                </h4>
                <p className="text-sm text-gray-600 mb-2">{task.aiReasoning}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Задано вопросов:</span>
                  <Badge variant="outline">{task.questionsAsked.length}</Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            AI-координатор задач
          </CardTitle>
          <p className="text-gray-600">
            Опишите задачу, и AI поможет создать полное описание с уточняющими вопросами
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Опишите задачу, которую нужно организовать... Например: 'Нужно организовать помощь в приюте для животных в выходные'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[120px]"
            />
            
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings className="w-4 h-4 mr-2" />
                {showAdvanced ? 'Скрыть' : 'Показать'} настройки
              </Button>
              
              <Button onClick={startGeneration} disabled={isGenerating || !input.trim()}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Анализ...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Создать задачу
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Процесс генерации с вопросами */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Уточняющие вопросы
            </CardTitle>
            <div className="flex items-center gap-2">
              <Progress value={(session.currentStep / session.totalSteps) * 100} className="flex-1" />
              <span className="text-sm text-gray-600">
                {session.currentStep} / {session.totalSteps}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {session.status === 'collecting' && session.questions[session.currentStep] && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">
                    {session.questions[session.currentStep].question}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {session.questions[session.currentStep].context}
                  </p>
                  {renderQuestion(session.questions[session.currentStep])}
                </div>
              </div>
            )}
            
            {session.status === 'generating' && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">AI генерирует задачу...</p>
              </div>
            )}
            
            {session.status === 'completed' && (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">Задача успешно сгенерирована!</p>
              </div>
            )}
            
            {session.status === 'error' && (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
                <p className="text-gray-600">Ошибка при генерации задачи</p>
                <Button onClick={() => setSession(null)} className="mt-4">
                  Попробовать снова
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Сгенерированные задачи */}
      {generatedTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Сгенерированные задачи</h2>
          {generatedTasks.map((task, index) => (
            <div key={task.id}>
              {renderTask(task)}
            </div>
          ))}
        </div>
      )}

      {/* Пустое состояние */}
      {generatedTasks.length === 0 && !session && (
        <Card>
          <CardContent className="text-center py-12">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Начните создание задачи
            </h3>
            <p className="text-gray-500">
              Опишите задачу выше, и AI поможет создать полное описание
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
