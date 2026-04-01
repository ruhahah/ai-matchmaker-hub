import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { processAiMessage, publishTask, TaskData } from '@/lib/aiTaskInterview';
import TaskTemplates from '@/components/TaskTemplates';
import { findTemplateByKeywords, type TaskTemplate } from '@/lib/taskTemplates';
import { pushNotifications } from '@/lib/pushNotifications';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  Wrench, 
  Edit, 
  CheckCircle, 
  Send,
  MessageSquare,
  Loader2,
  Zap,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProgressField {
  key: keyof TaskData;
  label: string;
  icon: any;
  captured: boolean;
}

interface AiTaskInterviewerProps {
  onTaskCreated: (task: TaskData) => void;
}

export default function AiTaskInterviewer({ onTaskCreated }: AiTaskInterviewerProps) {
  // Предопределенные списки навыков
  const predefinedHardSkills = [
    'Программирование', 'Дизайн', 'SMM', 'Фотография', 'Видеомонтаж',
    'Иностранные языки', 'Перевод', 'Английский', 'Русский', 'Казахский',
    'IT и технологии', 'Базы данных', 'Веб-разработка', 'Мобильная разработка',
    'Медицина', 'Первая помощь', 'Ветеринария', 'Фармацевтика',
    'Строительство', 'Ремонт', 'Электрика', 'Сантехника', 'Работа с инструментами',
    'Финансы', 'Бухгалтерия', 'Юриспруденция', 'Маркетинг', 'Продажи',
    'Логистика', 'Транспорт', 'Безопасность', 'Охрана',
    'Экология', 'Садоводство', 'Агрономия', 'Работа с животными',
    'Кулинария', 'Готовка', 'Сервировка', 'Пекарское дело',
    'Музыка', 'Искусство', 'Журналистика', 'Писательство', 'Редактура'
  ];

  const predefinedSoftSkills = [
    'Коммуникация', 'Лидерство', 'Работа в команде', 'Ответственность',
    'Организация', 'Планирование', 'Координация', 'Многозадачность',
    'Эмпатия', 'Терпение', 'Воспитание', 'Работа с детьми',
    'Обучение', 'Менторство', 'Педагогика', 'Консультирование',
    'Креативность', 'Критическое мышление', 'Решение проблем',
    'Адаптивность', 'Гибкость', 'Стрессоустойчивость', 'Времяменеджмент',
    'Публичные выступления', 'Переговоры', 'Конфликтология',
    'Самомотивация', 'Инициативность', 'Надежность', 'Внимательность к деталям',
    'Позитивное отношение', 'Уважение', 'Толерантность', 'Инклюзивность',
    'Экологическое сознание', 'Социальная ответственность', 'Гражданская позиция'
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Привет! Я помогу тебе быстро создать социальную задачу. Можешь выбрать готовый шаблон или описать в свободной форме, что нужно сделать?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskData, setTaskData] = useState<TaskData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<TaskData | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [progress, setProgress] = useState<ProgressField[]>([
    { key: 'title', label: 'Название', icon: Sparkles, captured: false },
    { key: 'location', label: 'Локация события', icon: MapPin, captured: false },
    { key: 'date', label: 'Дата', icon: Calendar, captured: false },
    { key: 'volunteers_needed', label: 'Волонтеры', icon: Users, captured: false },
    { key: 'hardSkills', label: 'Hard Skills', icon: Wrench, captured: false },
    { key: 'softSkills', label: 'Soft Skills', icon: Users, captured: false },
    { key: 'description', label: 'Описание', icon: Edit, captured: false }
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const updateProgress = (data: Partial<TaskData>) => {
    const newProgress = progress.map(field => ({
      ...field,
      captured: data[field.key as keyof TaskData] !== undefined && 
               data[field.key as keyof TaskData] !== null && 
               data[field.key as keyof TaskData] !== '' &&
               (Array.isArray(data[field.key as keyof TaskData]) ? 
                (data[field.key as keyof TaskData] as any[]).length > 0 : 
                true)
    }));
    setProgress(newProgress);
  };

  const callAI = async (userMessage: string, conversationHistory: Message[]) => {
    try {
      const response = await processAiMessage(userMessage, conversationHistory);
      
      if (response.taskData) {
        // Полные данные получены
        setTaskData(response.taskData);
        updateProgress(response.taskData);
        return response.message;
      } else {
        // Уточняющий вопрос
        if (response.partialData) {
          updateProgress(response.partialData);
        }
        return response.message;
      }
    } catch (error) {
      console.error('AI Error:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await callAI(userMessage.content, messages);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: 'Ошибка AI',
        description: 'Не удалось получить ответ от AI. Попробуйте еще раз.',
        variant: 'destructive'
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Давайте попробуем еще раз. Что вы хотите сделать?',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishTask = async () => {
    if (!taskData) return;

    try {
      const result = await publishTask(taskData);

      if (result.success) {
        toast({
          title: 'Задача опубликована! 🎉',
          description: `${taskData.title} успешно добавлена на платформу.`
        });

        // Отправляем push-уведомление подходящим волонтерам
        await pushNotifications.sendNewResponseNotification(
          taskData.title,
          'Новая задача',
          taskData.id || 'new-task'
        );

        onTaskCreated(taskData);
        
        // Сброс формы
        setTaskData(null);
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: 'Отлично! Задача создана. Хотите создать еще одну задачу?',
            timestamp: new Date()
          }
        ]);
        setProgress(progress.map(p => ({ ...p, captured: false })));
      }
    } catch (error) {
      toast({
        title: 'Ошибка публикации',
        description: 'Не удалось опубликовать задачу. Попробуйте еще раз.',
        variant: 'destructive'
      });
    }
  };

  const handleTemplateSelect = (template: TaskTemplate) => {
    const templateData: TaskData = {
      id: `template-${Date.now()}`,
      title: template.name,
      description: template.description,
      location: template.defaultLocation,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Через неделю
      volunteers_needed: template.volunteerCount,
      hardSkills: template.defaultSkills.slice(0, 3), // Первые 3 навыка как hard
      softSkills: template.defaultSkills.slice(3, 6), // Остальные как soft
      urgency: template.defaultUrgency,
      category: template.category,
      estimatedDuration: template.estimatedDuration,
      difficulty: template.difficulty
    };

    setTaskData(templateData);
    setShowTemplates(false);
    
    // Обновляем прогресс
    setProgress(progress.map(p => ({ ...p, captured: true })));

    // Добавляем сообщение о выборе шаблона
    const templateMessage: Message = {
      id: (Date.now()).toString(),
      role: 'assistant',
      content: `Отлично! Я создал задачу на основе шаблона "${template.name}". Проверьте данные и опубликуйте, или отредактируйте при необходимости.`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, templateMessage]);

    toast({
      title: 'Шаблон выбран',
      description: `Задача "${template.name}" готова к публикации.`
    });
  };

  const handleEditManually = () => {
    if (!taskData) return;
    
    // Копируем данные для редактирования
    setEditData({ ...taskData });
    setIsEditing(true);
    
    toast({
      title: 'Режим редактирования',
      description: 'Теперь вы можете изменить все поля задачи.',
    });
  };

  const handleSaveEdit = () => {
    if (!editData) return;
    
    // Валидация
    if (!editData.title || !editData.description || !editData.location || 
        !editData.date || !editData.volunteers_needed || 
        (!editData.hardSkills || editData.hardSkills.length === 0) || 
        (!editData.softSkills || editData.softSkills.length === 0)) {
      toast({
        title: 'Ошибка валидации',
        description: 'Заполните все обязательные поля и добавьте хотя бы один hard и один soft навык.',
        variant: 'destructive'
      });
      return;
    }
    
    // Обновляем данные
    setTaskData(editData);
    updateProgress(editData);
    setIsEditing(false);
    setEditData(null);
    
    toast({
      title: 'Изменения сохранены',
      description: 'Задача успешно отредактирована.',
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleEditFieldChange = (field: keyof TaskData, value: any) => {
    if (!editData) return;
    
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillAdd = (skill: string, type: 'hard' | 'soft') => {
    if (!editData || !skill.trim()) return;
    
    const newSkill = skill.trim();
    const skillsArray = type === 'hard' ? editData.hardSkills || [] : editData.softSkills || [];
    
    if (!skillsArray.includes(newSkill)) {
      if (type === 'hard') {
        handleEditFieldChange('hardSkills', [...skillsArray, newSkill]);
      } else {
        handleEditFieldChange('softSkills', [...skillsArray, newSkill]);
      }
    }
  };

  const handleSkillRemove = (skillToRemove: string, type: 'hard' | 'soft') => {
    if (!editData) return;
    
    if (type === 'hard') {
      const updatedSkills = (editData.hardSkills || []).filter(skill => skill !== skillToRemove);
      handleEditFieldChange('hardSkills', updatedSkills);
    } else {
      const updatedSkills = (editData.softSkills || []).filter(skill => skill !== skillToRemove);
      handleEditFieldChange('softSkills', updatedSkills);
    }
  };

  const handleSkillSelect = (skill: string, type: 'hard' | 'soft') => {
    if (!editData || !skill) return;
    
    const skillsArray = type === 'hard' ? editData.hardSkills || [] : editData.softSkills || [];
    
    if (!skillsArray.includes(skill)) {
      if (type === 'hard') {
        handleEditFieldChange('hardSkills', [...skillsArray, skill]);
      } else {
        handleEditFieldChange('softSkills', [...skillsArray, skill]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (taskData) {
    return (
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg">
          <h3 className="font-semibold text-blue-900">Данные собраны</h3>
          <div className="flex gap-2">
            {progress.map((field) => (
              <div key={String(field.key)} className="flex items-center gap-1">
                <field.icon className={cn(
                  "w-4 h-4",
                  field.captured ? "text-green-600" : "text-gray-400"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  field.captured ? "text-green-700" : "text-gray-500"
                )}>
                  {field.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Review Card */}
        <Card className="border-2 border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Готово к публикации
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <h4 className="font-semibold text-lg">{taskData.title}</h4>
                <p className="text-gray-600 mt-1">{taskData.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Локация события:</span>
                  <span className="text-sm">{taskData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Дата:</span>
                  <span className="text-sm">{taskData.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Волонтеры:</span>
                  <span className="text-sm">{taskData.volunteers_needed}</span>
                </div>
                <div className="col-span-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Навыки:</span>
                  </div>
                  <div className="space-y-2 pl-6">
                    {taskData.hardSkills && taskData.hardSkills.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-blue-700">Hard Skills:</span>
                        <div className="flex gap-1 mt-1">
                          {taskData.hardSkills.map(skill => (
                            <Badge key={skill} variant="secondary" className="text-xs bg-blue-50 text-blue-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {taskData.softSkills && taskData.softSkills.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-green-700">Soft Skills:</span>
                        <div className="flex gap-1 mt-1">
                          {taskData.softSkills.map(skill => (
                            <Badge key={skill} variant="secondary" className="text-xs bg-green-50 text-green-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button onClick={handlePublishTask} className="flex-1 bg-gradient-to-r from-green-600 to-teal-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Опубликовать задачу
              </Button>
              <Button variant="outline" onClick={handleEditManually}>
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Mode */}
        {isEditing && editData && (
          <Card className="border-2 border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Edit className="w-5 h-5" />
                Редактирование задачи
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Название задачи</label>
                  <Input
                    value={editData.title || ''}
                    onChange={(e) => handleEditFieldChange('title', e.target.value)}
                    placeholder="Введите название задачи"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Описание</label>
                  <Textarea
                    value={editData.description || ''}
                    onChange={(e) => handleEditFieldChange('description', e.target.value)}
                    placeholder="Подробное описание задачи"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Локация события</label>
                    <Input
                      value={editData.location || ''}
                      onChange={(e) => handleEditFieldChange('location', e.target.value)}
                      placeholder="Точное место проведения в Астане"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Дата</label>
                    <Input
                      value={editData.date || ''}
                      onChange={(e) => handleEditFieldChange('date', e.target.value)}
                      placeholder="ДД.ММ.ГГГГ"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Количество волонтеров</label>
                  <Input
                    type="number"
                    value={editData.volunteers_needed || ''}
                    onChange={(e) => handleEditFieldChange('volunteers_needed', parseInt(e.target.value) || 0)}
                    placeholder="Необходимое количество"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Необходимые навыки</label>
                  <div className="space-y-4">
                    {/* Hard Skills */}
                    <div>
                      <label className="text-xs font-medium text-blue-700 mb-2 block">Hard Skills (технические навыки)</label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Select onValueChange={(skill) => handleSkillSelect(skill, 'hard')}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Выберите технический навык" />
                            </SelectTrigger>
                            <SelectContent>
                              <ScrollArea className="h-60">
                                {predefinedHardSkills.map(skill => (
                                  <SelectItem 
                                    key={skill} 
                                    value={skill}
                                    disabled={editData?.hardSkills?.includes(skill)}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span>{skill}</span>
                                      {editData?.hardSkills?.includes(skill) && (
                                        <span className="text-xs text-green-600 ml-2">✓ Добавлен</span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            placeholder="Или введите свой технический навык"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSkillAdd(e.currentTarget.value, 'hard');
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder*="Или введите свой технический навык"]') as HTMLInputElement;
                              if (input) {
                                handleSkillAdd(input.value, 'hard');
                                input.value = '';
                              }
                            }}
                          >
                            Добавить
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {editData.hardSkills?.map(skill => (
                            <Badge key={skill} variant="secondary" className="flex items-center gap-1 bg-blue-50">
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleSkillRemove(skill, 'hard')}
                                className="ml-1 text-xs hover:text-red-600"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Soft Skills */}
                    <div>
                      <label className="text-xs font-medium text-green-700 mb-2 block">Soft Skills (мягкие навыки)</label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Select onValueChange={(skill) => handleSkillSelect(skill, 'soft')}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Выберите мягкий навык" />
                            </SelectTrigger>
                            <SelectContent>
                              <ScrollArea className="h-60">
                                {predefinedSoftSkills.map(skill => (
                                  <SelectItem 
                                    key={skill} 
                                    value={skill}
                                    disabled={editData?.softSkills?.includes(skill)}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span>{skill}</span>
                                      {editData?.softSkills?.includes(skill) && (
                                        <span className="text-xs text-green-600 ml-2">✓ Добавлен</span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            placeholder="Или введите свой мягкий навык"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSkillAdd(e.currentTarget.value, 'soft');
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder*="Или введите свой мягкий навык"]') as HTMLInputElement;
                              if (input) {
                                handleSkillAdd(input.value, 'soft');
                                input.value = '';
                              }
                            }}
                          >
                            Добавить
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {editData.softSkills?.map(skill => (
                            <Badge key={skill} variant="secondary" className="flex items-center gap-1 bg-green-50">
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleSkillRemove(skill, 'soft')}
                                className="ml-1 text-xs hover:text-red-600"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button onClick={handleSaveEdit} className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Сохранить изменения
                </Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Tracking */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3">Сбор данных</h3>
        <div className="flex flex-wrap gap-3">
          {progress.map((field) => (
            <div
              key={String(field.key)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full border transition-all",
                field.captured
                  ? "bg-green-100 border-green-300 text-green-800"
                  : "bg-white border-gray-200 text-gray-500"
              )}
            >
              <field.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{field.label}</span>
              {field.captured && <CheckCircle className="w-3 h-3" />}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Sparkles className="w-5 h-5" />
            AI Ассистент создания задач
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 h-[350px]">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-3",
                      message.role === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={cn(
                      "text-xs mt-1 opacity-70",
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    )}>
                      {message.timestamp.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">AI думает...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t bg-white shrink-0">
            {!taskData && (
              <div className="mb-3">
                <Button
                  onClick={() => setShowTemplates(!showTemplates)}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {showTemplates ? 'Скрыть шаблоны' : 'Выбрать шаблон задачи'}
                </Button>
              </div>
            )}
            
            {showTemplates && !taskData && (
              <div className="mb-3 max-h-96 overflow-y-auto">
                <TaskTemplates onTemplateSelect={handleTemplateSelect} />
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Опишите вашу задачу..."
                disabled={isLoading || showTemplates}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || isLoading || showTemplates}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
