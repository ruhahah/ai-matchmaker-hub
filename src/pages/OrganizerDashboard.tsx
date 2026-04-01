import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Plus, Eye, Edit, Users, Sparkles, UserPlus, CheckCircle, MapPin, Star, Clock, Target, TrendingUp, Bot, Filter, ArrowUpDown, Mail, Bell, MessageSquare, Calendar, Award, XCircle, ChevronRight } from 'lucide-react';
import { getTasks, getProfiles, aiSemanticMatching, type Task, type Profile, type MatchingResult } from '@/lib/mockApi';
import { demoDatabase, type DemoProfile } from '@/lib/demoDatabase';
import { useToast } from '@/hooks/use-toast';
import AiTaskInterviewer from '@/components/AiTaskInterviewer';
import { TaskData } from '@/lib/aiTaskInterview';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import ResponsesManager from '@/components/ResponsesManager';
import NotificationsPanel from '@/components/NotificationsPanel';
import { responsesDatabase } from '@/lib/responsesService';
import { backgroundManager } from '@/lib/backgroundManager';

interface EnhancedMatch extends MatchingResult {
  profile: DemoProfile;
  enhancedScore: number;
  originalScore: number;
  matchingSkills: string[];
  bonusReasons: string[];
}

export default function OrganizerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [matches, setMatches] = useState<EnhancedMatch[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [profiles, setProfiles] = useState<DemoProfile[]>([]);
  const [activeTab, setActiveTab] = useState('create');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [savingTask, setSavingTask] = useState(false);
  const [actionStatus, setActionStatus] = useState<Record<string, Record<string, boolean>>>({});
  const [matchFilters, setMatchFilters] = useState({
    minScore: 0,
    skills: [] as string[],
    availability: 'all' as 'all' | 'available' | 'busy'
  });
  const [sortBy, setSortBy] = useState<'score' | 'experience' | 'rating'>('score');
  
  // Состояние для системы откликов
  const [selectedTaskForResponses, setSelectedTaskForResponses] = useState<Task | null>(null);
  const [responsesPanelOpen, setResponsesPanelOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  // Состояние для вкладки откликов
  const [allResponses, setAllResponses] = useState<any[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responseFilters, setResponseFilters] = useState({
    status: 'all',
    task: 'all',
    experience: 'all'
  });
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  
  // Состояние для фильтрации задач
  const [taskFilters, setTaskFilters] = useState({
    status: 'all',
    urgency: 'all'
  });

  useEffect(() => {
    // Используем demoDatabase для получения пользователей и задач
    const allUsers = demoDatabase.getUsers();
    const volunteerUsers = allUsers.filter(user => user.role === 'volunteer');
    
    // Получаем задачи из demoDatabase
    const tasksFromDemo = demoDatabase.getTasks().map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      location: t.location,
      date: t.date,
      urgency: t.urgency,
      status: t.status,
      requiredVolunteers: t.requiredVolunteers,
      skills: t.skills || [],
      createdAt: t.createdAt,
      creatorId: t.creatorId
    }));
    
    setTasks(tasksFromDemo);
    setProfiles(volunteerUsers);
    setLoading(false);
    
    // Загружаем количество непрочитанных уведомлений
    setUnreadNotifications(responsesDatabase.getUnreadCount('org-1'));
    
    // Загружаем все отклики для вкладки откликов
    loadAllResponses();
  }, []);

  useEffect(() => {
    loadTasks();
    loadProfiles();
    
    // Запускаем фоновый AI-менеджер
    backgroundManager.start();
    
    // Запрашиваем разрешение на уведомления
    backgroundManager.requestNotificationPermission();

    // Останавливаем фоновый менеджер при размонтировании
    return () => {
      backgroundManager.stop();
    };
  }, []);

  useEffect(() => {
    loadAllResponses();
  }, [tasks.length]);

  // Функции для управления откликами
  const loadAllResponses = () => {
    setResponsesLoading(true);
    try {
      // Получаем все отклики для всех задач
      const allTaskResponses: any[] = [];
      tasks.forEach(task => {
        const taskResponses = responsesDatabase.getTaskResponses(task.id || `task-${task.title}`);
        taskResponses.forEach(response => {
          allTaskResponses.push({
            ...response,
            taskId: task.id,
            taskTitle: task.title,
            taskLocation: task.location,
            taskUrgency: task.urgency,
            taskSkills: task.skills
          });
        });
      });
      setAllResponses(allTaskResponses);
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setResponsesLoading(false);
    }
  };

  // Функции для управления откликами
  const handleViewResponses = (task: Task) => {
    setSelectedTaskForResponses(task);
    setResponsesPanelOpen(true);
  };

  const handleNotificationsClick = () => {
    setNotificationsOpen(true);
  };

  // Функции для действий с откликами
  const handleResponseAction = (responseId: string, action: 'accept' | 'reject' | 'view') => {
    if (action === 'view') {
      const response = allResponses.find(r => r.id === responseId);
      setSelectedResponse(response);
      setResponseDialogOpen(true);
    } else if (action === 'accept' || action === 'reject') {
      const updated = responsesDatabase.updateResponseStatus(
        responseId, 
        action === 'accept' ? 'accepted' : 'rejected', 
        action === 'accept' ? 'Приглашаем вас к участию!' : 'К сожалению, ваш отклик не подходит.',
        'org-1'
      );
      
      if (updated) {
        loadAllResponses();
        toast({
          title: action === 'accept' ? 'Отлик принят' : 'Отклик отклонен',
          description: `Волонтер получил уведомление о решении`,
        });
      }
    }
  };

  const getFilteredResponses = () => {
    let filtered = allResponses;
    
    if (responseFilters.status !== 'all') {
      filtered = filtered.filter(r => r.status === responseFilters.status);
    }
    
    if (responseFilters.task !== 'all') {
      filtered = filtered.filter(r => r.taskId === responseFilters.task);
    }
    
    if (responseFilters.experience !== 'all') {
      filtered = filtered.filter(r => r.experience === responseFilters.experience);
    }
    
    return filtered;
  };

  const getResponseStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResponseStats = () => {
    const filtered = getFilteredResponses();
    return {
      total: filtered.length,
      pending: filtered.filter(r => r.status === 'pending').length,
      accepted: filtered.filter(r => r.status === 'accepted').length,
      rejected: filtered.filter(r => r.status === 'rejected').length
    };
  };

  // Функции для фильтрации задач
  const getFilteredTasks = () => {
    let filtered = tasks;
    
    if (taskFilters.status !== 'all') {
      filtered = filtered.filter(task => task.status === taskFilters.status);
    }
    
    if (taskFilters.urgency !== 'all') {
      filtered = filtered.filter(task => task.urgency === taskFilters.urgency);
    }
    
    return filtered;
  };

  const getTaskStats = () => {
    return {
      total: tasks.length,
      open: tasks.filter(t => t.status === 'open').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length
    };
  };

  const { toast } = useToast();

  const handleTaskCreated = (taskData: TaskData) => {
    // Создаем новую задачу в demoDatabase
    const newTask = demoDatabase.createTask({
      title: taskData.title,
      description: taskData.description,
      skills: [...(taskData.hardSkills || []), ...(taskData.softSkills || [])], // Объединяем навыки для совместимости
      location: taskData.location,
      urgency: 'medium',
      requiredVolunteers: taskData.volunteers_needed || 1,
      date: taskData.date,
      creatorId: 'org-1'
    });

    setTasks(prev => [...prev, newTask]);
    
    // Обновляем отклики после создания новой задачи
    setTimeout(() => {
      loadAllResponses();
    }, 100);
    
    // Переключаем на вкладку задач
    setActiveTab('tasks');
    
    toast({
      title: '✅ Задача создана!',
      description: `"${taskData.title}" добавлена в список активных задач.`,
    });
  };

  // Filter and sort matches
  const getFilteredAndSortedMatches = () => {
    let filtered = matches.filter(match => match.enhancedScore >= matchFilters.minScore);
    
    if (matchFilters.skills.length > 0) {
      filtered = filtered.filter(match => 
        match.matchingSkills.some(skill => matchFilters.skills.includes(skill))
      );
    }
    
    if (matchFilters.availability === 'available') {
      filtered = filtered.filter(match => match.profile.stats.tasksCompleted > 5);
    }
    
    // Sort by selected criteria
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.enhancedScore - a.enhancedScore;
        case 'experience':
          return b.profile.stats.tasksCompleted - a.profile.stats.tasksCompleted;
        case 'rating':
          return b.profile.stats.rating - a.profile.stats.rating;
        default:
          return 0;
      }
    });
    
    return sorted;
  };

  // Get all unique skills from matches
  const getAllSkills = () => {
    const skills = new Set<string>();
    matches.forEach(match => {
      match.matchingSkills.forEach(skill => skills.add(skill));
    });
    return Array.from(skills).sort();
  };

  const handleTaskUpdated = async (updatedTask: Task) => {
    setSavingTask(true);
    try {
      console.log('Starting task update:', updatedTask);
      
      // Используем демо базу данных
      console.log('Trying demoDatabase update...');
      const result = demoDatabase.updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        location: updatedTask.location,
        status: updatedTask.status,
        urgency: updatedTask.urgency,
        skills: updatedTask.skills,
        requiredVolunteers: updatedTask.requiredVolunteers,
        startTime: updatedTask.startTime
      });
      
      console.log('DemoDatabase update result:', result);
      
      if (!result) {
        throw new Error('Task not found in demo database');
      }
      console.log('DemoDatabase update successful');
      
      // Обновляем локальное состояние
      console.log('Updating local state...');
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? {...updatedTask, status: updatedTask.status as 'open' | 'in_progress' | 'completed'} : task
      ));
      setEditingTask(null);
      console.log('Local state updated');
      
      toast({
        title: '✅ Задача обновлена',
        description: 'Изменения сохранены успешно',
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Ошибка сохранения',
        description: `Не удалось сохранить изменения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        variant: 'destructive',
      });
    } finally {
      setSavingTask(false);
    }
  };

  const handleViewMatches = async (task: Task) => {
    setSelectedTask(task);
    setMatchLoading(true);
    try {
      // Запрашиваем всех волонтеров и получаем топ-10 наиболее подходящих
      const allProfiles = profiles.filter(p => p.role === 'volunteer');
      
      if (allProfiles.length === 0) {
        toast({
          title: 'Нет волонтеров',
          description: 'В базе данных нет волонтеров для поиска',
          variant: 'destructive',
        });
        return;
      }
      
      // Используем ID задачи или создаем временный ID для демо
      const taskId = task.id || `task-${task.title.replace(/\s+/g, '-').toLowerCase()}`;
      
      // Получаем базовые мэтчи через AI
      const matches = await aiSemanticMatching(taskId, allProfiles.map(p => p.id));
      
      // Улучшенная система подсчета очков совпадения
      const enhancedMatches = matches.map(match => {
        const profile = profiles.find(p => p.id === match.volunteerId);
        if (!profile) {
          // Создаем минимальный профиль для несуществующих пользователей
          const fallbackProfile: DemoProfile = {
            id: match.volunteerId,
            name: 'Неизвестный волонтер',
            email: '',
            role: 'volunteer',
            bio: 'Профиль не найден',
            avatar: '',
            location: '',
            skills: [],
            friends: [],
            friendRequests: { sent: [], received: [] },
            stats: { tasksCompleted: 0, hoursVolunteered: 0, rating: 0 },
            invitations: []
          };
          
          return {
            ...match,
            profile: fallbackProfile,
            enhancedScore: match.score,
            originalScore: match.score,
            matchingSkills: [],
            bonusReasons: []
          };
        }
        
        let enhancedScore = match.score;
        let bonusReasons: string[] = [];
        
        // Бонус за совпадение навыков (каждый совпавший навык +0.1)
        const matchingSkills = task.skills?.filter(skill => 
          profile.skills.some(profileSkill => 
            profileSkill.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(profileSkill.toLowerCase())
          )
        ) || [];
        
        if (matchingSkills.length > 0) {
          enhancedScore += (matchingSkills.length * 0.1);
          bonusReasons.push(`${matchingSkills.length} совпавших навыков`);
        }
        
        // Бонус за локацию (если в том же городе +0.15)
        if (profile.location === task.location || 
            profile.location.includes(task.location?.split(',')[0] || '') ||
            task.location?.includes(profile.location)) {
          enhancedScore += 0.15;
          bonusReasons.push('Локация совпадает');
        }
        
        // Бонус за опыт (более 15 выполненных задач +0.1)
        if (profile.stats.tasksCompleted > 15) {
          enhancedScore += 0.1;
          bonusReasons.push('Опытный волонтер');
        }
        
        // Бонус за высокий рейтинг (4.8+ +0.1)
        if (profile.stats.rating >= 4.8) {
          enhancedScore += 0.1;
          bonusReasons.push('Высокий рейтинг');
        }
        
        // Бонус за доступность (если не занят в это время)
        const taskHour = task.startTime ? parseInt(task.startTime.split(':')[0]) : 12;
        if (taskHour >= 9 && taskHour <= 18) {
          enhancedScore += 0.05; // Предполагаем, что волонтеры доступны днем
          bonusReasons.push('Удобное время');
        }
        
        // Ограничиваем максимальный счет
        enhancedScore = Math.min(enhancedScore, 1.0);
        
        return {
          ...match,
          enhancedScore,
          profile,
          matchingSkills,
          bonusReasons,
          originalScore: match.score
        };
      });
      
      // Сортируем по улучшенному счету
      const sortedMatches = enhancedMatches
        .sort((a, b) => b.enhancedScore - a.enhancedScore)
        .slice(0, 10); // Топ-10 лучших мэтчей
      
      setMatches(sortedMatches);
      
      // Показываем детальную информацию о лучших мэтчах
      const topMatch = sortedMatches[0];
      const improvement = topMatch ? ((topMatch.enhancedScore - topMatch.originalScore) * 100).toFixed(1) : '0';
      
      toast({
        title: '🎯 Найдены лучшие волонтеры!',
        description: `Топ-${sortedMatches.length} кандидатов с улучшенным мэтчингом. Лучший кандидат: ${topMatch?.profile.name} (${Math.round(topMatch.enhancedScore * 100)}% совпадение, улучшение на ${improvement}%)`,
      });
    } catch (err: any) {
      console.error('Error loading matches:', err);
      toast({
        title: 'Ошибка при поиске мэтчей',
        description: err.message || 'Не удалось найти подходящих волонтеров',
        variant: 'destructive',
      });
    } finally {
      setMatchLoading(false);
    }
  };

  const handleRefreshMatches = async () => {
    if (!selectedTask) {
      toast({
        title: 'Ошибка',
        description: 'Задача не выбрана',
        variant: 'destructive',
      });
      return;
    }
    
    // Просто вызываем handleViewMatches с текущей задачей
    await handleViewMatches(selectedTask);
    
    toast({
      title: '🔄 Мэтчи обновлены',
      description: 'Список подходящих волонтеров обновлен',
    });
  };

  const handleResetDemoData = () => {
    demoDatabase.resetDemoData();
    
    // Перезагружаем задачи
    const allUsers = demoDatabase.getUsers();
    const volunteerUsers = allUsers.filter(user => user.role === 'volunteer');
    
    const tasksFromDemo = demoDatabase.getTasks().map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      skills: t.skills || [],
      location: t.location || '',
      status: t.status as Task['status'],
      creatorId: t.creatorId,
      urgency: t.urgency as 'low' | 'medium' | 'high',
      requiredVolunteers: t.requiredVolunteers || 1,
      startTime: t.startTime,
      created_at: t.created_at || new Date().toISOString()
    }));
    
    setTasks(tasksFromDemo);
    setProfiles(volunteerUsers);
    
    toast({
      title: '📊 Данные обновлены',
      description: 'Загружены новые демо данные для аналитики',
    });
  };

  const handleInviteVolunteer = async (match: MatchingResult & { profile?: Profile }) => {
    if (!selectedTask || !match.profile) return;
    
    try {
      // Mock invitation creation
      const invitation = {
        id: `inv-${Date.now()}`,
        task_id: selectedTask.id,
        task_title: selectedTask.title,
        task_description: selectedTask.description,
        task_skills: selectedTask.skills,
        task_location: selectedTask.location,
        task_start_time: new Date().toISOString(),
        invitation_text: `Приглашаем вас принять участие в задаче "${selectedTask.title}"`,
        similarity_score: match.score,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: '✅ Приглашение отправлено!',
        description: `${match.profile.name} получил приглашение на задачу "${selectedTask.title}"`,
      });
      
      // Optionally remove from matches after invitation
      setMatches(prev => prev.filter(m => m.volunteerId !== match.volunteerId));
      
    } catch (err: any) {
      toast({
        title: 'Ошибка',
        description: err.message || 'Не удалось отправить приглашение',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'verifying': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Открыта';
      case 'verifying': return 'Проверка';
      case 'completed': return 'Завершена';
      case 'cancelled': return 'Отменена';
      default: return status;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Срочно';
      case 'medium': return 'Средняя';
      case 'low': return 'Низкая';
      default: return urgency;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🏛️ Кабинет организатора
              </h1>
              <p className="text-gray-600">
                Управляйте социальными задачами и находите идеальных волонтеров с помощью AI
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={handleNotificationsClick}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
                Уведомления
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger 
              value="create" 
              className="flex items-center gap-2"
              onClick={() => setActiveTab('create')}
            >
              <Bot className="w-4 h-4" />
              Создать задачу
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="flex items-center gap-2"
              onClick={() => setActiveTab('tasks')}
            >
              <Sparkles className="w-4 h-4" />
              Задачи ({tasks.length})
            </TabsTrigger>
            <TabsTrigger 
              value="responses" 
              className="flex items-center gap-2"
              onClick={() => setActiveTab('responses')}
            >
              <UserPlus className="w-4 h-4" />
              Отклики
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2"
              onClick={() => setActiveTab('analytics')}
            >
              <Eye className="w-4 h-4" />
              Аналитика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <AiTaskInterviewer onTaskCreated={handleTaskCreated} />
          </TabsContent>

          <TabsContent value="tasks">
            <div className="space-y-6">
              {/* Статистика задач */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">{getTaskStats().total}</div>
                    <div className="text-sm text-blue-600">Всего задач</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{getTaskStats().open}</div>
                    <div className="text-sm text-green-600">Открыты</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-700">{getTaskStats().inProgress}</div>
                    <div className="text-sm text-yellow-600">В прогрессе</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">{getTaskStats().completed}</div>
                    <div className="text-sm text-purple-600">Завершены</div>
                  </CardContent>
                </Card>
              </div>

              {/* Фильтры задач */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Фильтры задач
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Select 
                      value={taskFilters.status} 
                      onValueChange={(value) => {
                        setTaskFilters(prev => ({ ...prev, status: value }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Статус задачи" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="open">Открыты</SelectItem>
                        <SelectItem value="in_progress">В прогрессе</SelectItem>
                        <SelectItem value="completed">Завершены</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={taskFilters.urgency} 
                      onValueChange={(value) => {
                        setTaskFilters(prev => ({ ...prev, urgency: value }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Срочность" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все уровни</SelectItem>
                        <SelectItem value="low">Низкая</SelectItem>
                        <SelectItem value="medium">Средняя</SelectItem>
                        <SelectItem value="high">Высокая</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Список задач */}
              <div className="grid gap-6">
                {getFilteredTasks().length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <div className="text-6xl mb-4">📋</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {tasks.length === 0 ? "Пока нет задач" : "Нет задач по выбранным фильтрам"}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {tasks.length === 0 
                          ? "Создайте свою первую задачу с помощью AI-координатора"
                          : "Попробуйте изменить фильтры для поиска задач"
                        }
                      </p>
                      {tasks.length === 0 && (
                        <Button onClick={() => setActiveTab('create')}>
                          Перейти к созданию
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  getFilteredTasks().map((task) => (
                  <Card key={task.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{task.title}</CardTitle>
                          <p className="text-gray-600 mb-4">{task.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className={getStatusColor(task.status)}>
                              {getStatusLabel(task.status)}
                            </Badge>
                            <Badge className={getUrgencyColor(task.urgency)}>
                              {getUrgencyLabel(task.urgency)}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {task.location}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {task.requiredVolunteers ? 
                                `${task.requiredVolunteers} ${task.requiredVolunteers === 1 ? 'волонтер' : 
                                  task.requiredVolunteers > 1 && task.requiredVolunteers < 5 ? 'волонтера' : 'волонтеров'}` 
                                : 'Нужно волонтеров'
                              }
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(task.startTime).toLocaleDateString('ru-RU')}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {task.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTask(task)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Изменить
                          </Button>
                          {!matchLoading && selectedTask?.id === task.id && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewMatches(task)}
                              disabled={matchLoading}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Мэтчи
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewResponses(task)}
                              className="bg-blue-50 border-blue-200"
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              Отклики
                            </Button>
                          </>
                        )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="responses">
            <div className="space-y-6">
              {/* Статистика откликов */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">{getResponseStats().total}</div>
                    <div className="text-sm text-blue-600">Всего откликов</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-700">{getResponseStats().pending}</div>
                    <div className="text-sm text-yellow-600">Ожидают решения</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{getResponseStats().accepted}</div>
                    <div className="text-sm text-green-600">Приняты</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-700">{getResponseStats().rejected}</div>
                    <div className="text-sm text-red-600">Отклонены</div>
                  </CardContent>
                </Card>
              </div>

              {/* Фильтры */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Фильтры откликов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <Select 
                      value={responseFilters.status} 
                      onValueChange={(value) => {
                        setResponseFilters(prev => ({ ...prev, status: value }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="pending">Ожидают</SelectItem>
                        <SelectItem value="accepted">Приняты</SelectItem>
                        <SelectItem value="rejected">Отклонены</SelectItem>
                        <SelectItem value="withdrawn">Отозваны</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={responseFilters.task} 
                      onValueChange={(value) => {
                        setResponseFilters(prev => ({ ...prev, task: value }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Задача" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все задачи</SelectItem>
                        {tasks.map(task => (
                          <SelectItem key={task.id} value={task.id || `task-${task.title}`}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select 
                      value={responseFilters.experience} 
                      onValueChange={(value) => {
                        setResponseFilters(prev => ({ ...prev, experience: value }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Опыт" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все уровни</SelectItem>
                        <SelectItem value="beginner">Начинающие</SelectItem>
                        <SelectItem value="intermediate">С опытом</SelectItem>
                        <SelectItem value="expert">Эксперты</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Список откликов */}
              <div className="space-y-4">
                {responsesLoading ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin mr-2" />
                      <span>Загрузка откликов...</span>
                    </CardContent>
                  </Card>
                ) : getFilteredResponses().length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Нет откликов
                      </h3>
                      <p className="text-gray-600">
                        {allResponses.length === 0 
                          ? "На ваши задачи еще нет откликов" 
                          : "Нет откликов, соответствующих выбранным фильтрам"
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  getFilteredResponses().map((response) => (
                    <Card key={response.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={response.volunteerAvatar} />
                              <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold">
                                {response.volunteerName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900">{response.volunteerName}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className={getResponseStatusColor(response.status)}>
                                      <div className="flex items-center gap-1">
                                        {response.status === 'pending' && <Clock className="w-3 h-3" />}
                                        {response.status === 'accepted' && <CheckCircle className="w-3 h-3" />}
                                        {response.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                        {response.status === 'withdrawn' && <XCircle className="w-3 h-3" />}
                                        {response.status === 'pending' && 'Ожидает'}
                                        {response.status === 'accepted' && 'Принят'}
                                        {response.status === 'rejected' && 'Отклонен'}
                                        {response.status === 'withdrawn' && 'Отозван'}
                                      </div>
                                    </Badge>
                                    {response.matchingScore && (
                                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm font-medium text-yellow-700">{Math.round(response.matchingScore * 100)}% совпадение</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">
                                    {new Date(response.appliedAt).toLocaleDateString('ru-RU', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Award className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">Задача: {response.taskTitle}</span>
                                </div>
                                <p className="text-gray-700">{response.message}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-sm font-medium text-gray-600">Опыт:</span>
                                  <p className="text-gray-800">{response.experience}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-600">Доступность:</span>
                                  <p className="text-gray-800">{response.availability}</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <span className="text-sm font-medium text-gray-600">Навыки:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {[...response.hardSkills, ...response.softSkills].slice(0, 6).map(skill => (
                                      <Badge key={skill} variant="secondary" className="text-xs bg-blue-50 text-blue-800">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {[...response.hardSkills, ...response.softSkills].length > 6 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{[...response.hardSkills, ...response.softSkills].length - 6}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {response.reviewMessage && (
                                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                  <span className="font-medium text-blue-900">Комментарий организатора:</span>
                                  <p className="text-blue-800 text-sm mt-1">{response.reviewMessage}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            {response.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleResponseAction(response.id, 'accept')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Принять
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleResponseAction(response.id, 'reject')}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Отклонить
                                </Button>
                              </>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleResponseAction(response.id, 'view')}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Подробнее
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="mb-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResetDemoData}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Обновить демо данные
              </Button>
            </div>
            <AdvancedAnalytics />
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Matches Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI-рекомендации для "{selectedTask?.title}"
              </DialogTitle>
            </DialogHeader>
            
            {matchLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">AI ищет идеальных кандидатов...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Filters Panel */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Фильтры и сортировка</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setMatchFilters({ minScore: 0, skills: [], availability: 'all' })}
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Сбросить
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Score Filter */}
                    <div>
                      <Label className="text-xs font-medium">Мин. совпадение: {Math.round(matchFilters.minScore * 100)}%</Label>
                      <Slider
                        value={[matchFilters.minScore]}
                        onValueChange={([value]) => setMatchFilters({...matchFilters, minScore: value})}
                        max={1}
                        min={0}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    
                    {/* Sort By */}
                    <div>
                      <Label className="text-xs font-medium">Сортировка</Label>
                      <Select value={sortBy} onValueChange={(value: 'score' | 'experience' | 'rating') => setSortBy(value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="score">По релевантности</SelectItem>
                          <SelectItem value="experience">По опыту</SelectItem>
                          <SelectItem value="rating">По рейтингу</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Availability */}
                    <div>
                      <Label className="text-xs font-medium">Доступность</Label>
                      <Select value={matchFilters.availability} onValueChange={(value: 'all' | 'available' | 'busy') => setMatchFilters({...matchFilters, availability: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все волонтеры</SelectItem>
                          <SelectItem value="available">Опытные (5+ задач)</SelectItem>
                          <SelectItem value="busy">Новички</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Skills Filter */}
                  {getAllSkills().length > 0 && (
                    <div>
                      <Label className="text-xs font-medium">Навыки</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getAllSkills().map(skill => (
                          <div key={skill} className="flex items-center space-x-2">
                            <Checkbox
                              id={`skill-${skill}`}
                              checked={matchFilters.skills.includes(skill)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setMatchFilters({...matchFilters, skills: [...matchFilters.skills, skill]});
                                } else {
                                  setMatchFilters({...matchFilters, skills: matchFilters.skills.filter(s => s !== skill)});
                                }
                              }}
                            />
                            <Label htmlFor={`skill-${skill}`} className="text-xs">{skill}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Results Summary */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Найдено {getFilteredAndSortedMatches().length} из {matches.length} волонтеров
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefreshMatches}
                    disabled={matchLoading}
                  >
                    {matchLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Обновление...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Обновить мэтчи
                      </>
                    )}
                  </Button>
                </div>
                
                {getFilteredAndSortedMatches().map((match, index) => (
                  <Card key={match.volunteerId} className={`border-l-4 ${
                    index === 0 ? 'border-l-green-500 bg-green-50' : 
                    index === 1 ? 'border-l-blue-500 bg-blue-50' : 
                    index === 2 ? 'border-l-purple-500 bg-purple-50' :
                    'border-l-gray-300 bg-gray-50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{match.profile.name}</h4>
                            <Badge className={`${
                              index === 0 ? 'bg-green-100 text-green-800 border-green-200' : 
                              index === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                              index === 2 ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {Math.round(match.enhancedScore * 100)}% совпадение
                              {index === 0 && ' 🏆 Лучший мэтч'}
                              {index === 1 && ' 🥈 Второй мэтч'}
                              {index === 2 && ' 🥉 Третий мэтч'}
                            </Badge>
                            
                            {/* Показываем улучшение */}
                            {match.enhancedScore > match.originalScore && (
                              <Badge variant="outline" className="text-xs ml-2">
                                +{Math.round((match.enhancedScore - match.originalScore) * 100)}% улучшение
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">{match.profile.bio}</p>
                          
                          {/* Совпавшие навыки */}
                          {match.matchingSkills.length > 0 && (
                            <div className="mb-3">
                              <span className="text-xs text-green-600 font-medium">✓ Совпавшие навыки:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {match.matchingSkills.map(skill => (
                                  <Badge key={skill} variant="default" className="text-xs bg-green-100 text-green-800">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Навыки волонтера */}
                          {match.profile.skills.length > 0 && (
                            <div className="mb-3">
                              <span className="text-xs text-gray-500">Все навыки:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {match.profile.skills.slice(0, 4).map(skill => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {match.profile.skills.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{match.profile.skills.length - 4}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Метрики волонтера */}
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div>
                              <span className="text-xs text-gray-500">Опыт</span>
                              <div className="font-medium">{match.profile.stats.tasksCompleted} задач</div>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Рейтинг</span>
                              <div className="font-medium">⭐ {match.profile.stats.rating}/5</div>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Надежность</span>
                              <div className="font-medium text-green-600">{Math.round(match.enhancedScore * 100)}%</div>
                            </div>
                          </div>
                          
                          {/* AI причина рекомендации */}
                          {match.reason && (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg mb-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-blue-900">Почему рекомендуем:</span>
                              </div>
                              <p className="text-blue-800 text-sm">{match.reason}</p>
                            </div>
                          )}
                          
                          {/* Кнопки действий */}
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                const matchId = match.volunteerId;
                                setActionStatus(prev => ({
                                  ...prev,
                                  [matchId]: { ...prev[matchId], invited: true }
                                }));
                                toast({
                                  title: '� Приглашение отправлено',
                                  description: `${match.profile.name} получит уведомление о задаче`,
                                });
                              }}
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              {actionStatus[match.volunteerId]?.invited ? 'Приглашено' : 'Пригласить'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const matchId = match.volunteerId;
                                setActionStatus(prev => ({
                                  ...prev,
                                  [matchId]: { ...prev[matchId], emailed: true }
                                }));
                                toast({
                                  title: '� Email отправлен',
                                  description: `Письмо отправлено на ${match.profile.email}`,
                                });
                              }}
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              {actionStatus[match.volunteerId]?.emailed ? 'Отправлено' : 'Email'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const matchId = match.volunteerId;
                                setActionStatus(prev => ({
                                  ...prev,
                                  [matchId]: { ...prev[matchId], favorited: true }
                                }));
                                toast({
                                  title: '� Профиль добавлен в избранное',
                                  description: `${match.profile.name} добавлен в список избранных`,
                                });
                              }}
                            >
                              <Star className="w-3 h-3 mr-1" />
                              {actionStatus[match.volunteerId]?.favorited ? 'В избранном' : 'В избранное'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать задачу</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Название задачи</Label>
                  <Input
                    id="edit-title"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask(prev => prev ? {...prev, title: e.target.value} : null)}
                    placeholder="Введите название задачи"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-location">Локация</Label>
                  <Input
                    id="edit-location"
                    value={editingTask.location || ''}
                    onChange={(e) => setEditingTask(prev => prev ? {...prev, location: e.target.value} : null)}
                    placeholder="Укажите место проведения"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Описание</Label>
                <Textarea
                  id="edit-description"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask(prev => prev ? {...prev, description: e.target.value} : null)}
                  placeholder="Подробное описание задачи"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-urgency">Срочность</Label>
                  <Select 
                    value={editingTask.urgency || 'medium'} 
                    onValueChange={(value) => setEditingTask(prev => prev ? {...prev, urgency: value as 'low' | 'medium' | 'high'} : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низкая</SelectItem>
                      <SelectItem value="medium">Средняя</SelectItem>
                      <SelectItem value="high">Высокая</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-volunteers">Требуется волонтеров</Label>
                  <Input
                    id="edit-volunteers"
                    type="number"
                    value={editingTask.requiredVolunteers || 1}
                    onChange={(e) => setEditingTask(prev => prev ? {...prev, requiredVolunteers: parseInt(e.target.value) || 1} : null)}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Статус</Label>
                  <Select 
                    value={editingTask.status || 'open'} 
                    onValueChange={(value: 'open' | 'in_progress' | 'completed') => setEditingTask(prev => prev ? {...prev, status: value} : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Открыта</SelectItem>
                      <SelectItem value="in_progress">В процессе</SelectItem>
                      <SelectItem value="completed">Завершена</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-skills">Необходимые навыки (через запятую)</Label>
                <Input
                  id="edit-skills"
                  value={editingTask.skills?.join(', ') || ''}
                  onChange={(e) => setEditingTask(prev => prev ? {...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)} : null)}
                  placeholder="Например: Экология, Организация, Работа с детьми"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingTask(null)} disabled={savingTask}>
                  Отмена
                </Button>
                <Button onClick={() => handleTaskUpdated(editingTask!)} disabled={savingTask}>
                  {savingTask ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить изменения'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Responses Manager Dialog */}
      <Dialog open={responsesPanelOpen} onOpenChange={setResponsesPanelOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Управление откликами</DialogTitle>
          </DialogHeader>
          {selectedTaskForResponses && (
            <ResponsesManager 
              taskId={selectedTaskForResponses.id || `task-${selectedTaskForResponses.title}`} 
              taskTitle={selectedTaskForResponses.title}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Response Details Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Детали отклика
            </DialogTitle>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedResponse.volunteerAvatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold text-lg">
                    {selectedResponse.volunteerName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedResponse.volunteerName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getResponseStatusColor(selectedResponse.status)}>
                      {selectedResponse.status === 'pending' && 'Ожидает'}
                      {selectedResponse.status === 'accepted' && 'Принят'}
                      {selectedResponse.status === 'rejected' && 'Отклонен'}
                      {selectedResponse.status === 'withdrawn' && 'Отозван'}
                    </Badge>
                    {selectedResponse.matchingScore && (
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-700">{Math.round(selectedResponse.matchingScore * 100)}% совпадение</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Сообщение волонтера</h4>
                <p className="text-gray-700">{selectedResponse.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Опыт</h4>
                  <p className="text-gray-700">{selectedResponse.experience}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Доступность</h4>
                  <p className="text-gray-700">{selectedResponse.availability}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Задача</h4>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">{selectedResponse.taskTitle}</span>
                  </div>
                  <p className="text-blue-800 text-sm">{selectedResponse.taskLocation}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Навыки</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Hard Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedResponse.hardSkills.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs bg-blue-50 text-blue-800">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Soft Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedResponse.softSkills.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs bg-green-50 text-green-800">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <div>Дата отклика: {new Date(selectedResponse.appliedAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
                {selectedResponse.reviewedAt && (
                  <div>Дата рассмотрения: {new Date(selectedResponse.reviewedAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                )}
              </div>

              {selectedResponse.reviewMessage && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Комментарий организатора</h4>
                  <p className="text-blue-800">{selectedResponse.reviewMessage}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                {selectedResponse.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => {
                        handleResponseAction(selectedResponse.id, 'accept');
                        setResponseDialogOpen(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Принять
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        handleResponseAction(selectedResponse.id, 'reject');
                        setResponseDialogOpen(false);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Отклонить
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notifications Panel */}
      <NotificationsPanel 
        open={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)}
        userRole="organizer"
        userId="org-1"
      />
    </div>
  );
}
