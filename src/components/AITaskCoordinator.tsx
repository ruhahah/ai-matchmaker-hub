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
    const category = answers.category || 'Помощь';
    const action = extractAction(input);
    return `${category}: ${action}`;
  };

  const generateDescription = (input: string, answers: Record<string, any>): string => {
    return `Задача основана на вашем запросе: "${input}". ${generateDetailedDescription(answers)}`;
  };

  const generateDetailedDescription = (answers: Record<string, any>): string => {
    let desc = '';
    
    if (answers.age_group) {
      desc += `Целевая аудитория: ${answers.age_group}. `;
    }
    
    return desc;
  };

  const generateStartTime = (answers: Record<string, any>): string => {
    const urgency = answers.urgency;
    if (urgency === 'Критическая (немедленно)') return ' ASAP';
    if (urgency === 'Высокая (в ближайшие дни)') return 'Завтра';
    if (urgency === 'Средняя (в течение недели)') return 'На следующей неделе';
    return 'По согласованию';
  };

  const generateSkills = (answers: Record<string, any>): string[] => {
    const skills: string[] = [];
    
    if (answers.category) {
      skills.push(answers.category);
    }
    
    // Базовые навыки
    skills.push('Ответственность', 'Коммуникация');
    
    return [...new Set(skills)];
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
