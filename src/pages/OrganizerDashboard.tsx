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
import { Loader2, Plus, Eye, Edit, Users, Sparkles, UserPlus, CheckCircle, MapPin, Star, Clock, Target, TrendingUp, Bot, MessageCircle } from 'lucide-react';
import { getTasks, getProfiles, aiSemanticMatching, type Task, type Profile, type MatchingResult } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import AiTaskCreator from '@/components/AiTaskCreator';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';

export default function OrganizerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [matches, setMatches] = useState<(MatchingResult & { profile?: Profile })[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState('create');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    Promise.all([getTasks('organizer'), getProfiles('volunteer')]).then(([t, p]) => {
      setTasks(t);
      setProfiles(p);
      setLoading(false);
    });
  }, []);

  const { toast } = useToast();

  const handleTaskCreated = () => {
    // Refresh tasks list
    getTasks('organizer').then((t) => {
      setTasks(t);
      // Switch to tasks tab to show the new task
      setActiveTab('tasks');
    });
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? {...updatedTask, status: updatedTask.status as 'open' | 'in_progress' | 'completed'} : task
    ));
    setEditingTask(null);
    
    toast({
      title: '✅ Задача обновлена',
      description: 'Изменения сохранены успешно',
    });
  };

  const handleViewMatches = async (task: Task) => {
    setSelectedTask(task);
    setMatchLoading(true);
    try {
      // Запрашиваем всех волонтеров и получаем топ-10 наиболее подходящих
      const allProfiles = profiles.filter(p => p.role === 'volunteer');
      
      const matches = await aiSemanticMatching(task.id, allProfiles.map(p => p.id));
      
      // Сортируем по score (убывание) и добавляем профили
      const matchesWithProfiles = matches
        .sort((a, b) => b.score - a.score) // Сортировка по убыванию
        .slice(0, 10) // Берем топ-10
        .map(match => ({
          ...match,
          profile: profiles.find(p => p.id === match.volunteerId)
        }));
      
      setMatches(matchesWithProfiles);
    } catch (err: any) {
      toast({
        title: 'Failed to load matches',
        description: err.message || 'Could not load volunteer matches.',
        variant: 'destructive',
      });
    } finally {
      setMatchLoading(false);
    }
  };

  const handleRefreshMatches = async () => {
    if (!selectedTask) return;
    
    setMatchLoading(true);
    try {
      // Обновляем список волонтеров и получаем новые мэтчи
      const allProfiles = profiles.filter(p => p.role === 'volunteer');
      
      const matches = await aiSemanticMatching(selectedTask.id, allProfiles.map(p => p.id));
      
      // Сортируем по score (убывание) и добавляем профили
      const matchesWithProfiles = matches
        .sort((a, b) => b.score - a.score) // Сортировка по убыванию
        .slice(0, 10) // Берем топ-10
        .map(match => ({
          ...match,
          profile: profiles.find(p => p.id === match.volunteerId)
        }));
      
      setMatches(matchesWithProfiles);
      
      toast({
        title: '✅ Мэтчи обновлены',
        description: `Найдено ${matchesWithProfiles.length} релевантных волонтеров`,
      });
    } catch (err: any) {
      toast({
        title: 'Failed to refresh matches',
        description: err.message || 'Could not refresh volunteer matches.',
        variant: 'destructive',
      });
    } finally {
      setMatchLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏛️ Кабинет организатора
          </h1>
          <p className="text-gray-600">
            Управляйте социальными задачами и находите идеальных волонтеров с помощью AI
          </p>
        </div>

        <Tabs value={activeTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
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
              Активные задачи ({tasks.length})
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
            <AiTaskCreator onTaskCreated={handleTaskCreated} />
          </TabsContent>

          <TabsContent value="tasks">
            <div className="grid gap-6">
              {tasks.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Пока нет задач
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Создайте свою первую задачу с помощью AI-координатора
                    </p>
                    <Button onClick={() => window.location.reload()}>
                      Перейти к созданию
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                tasks.map((task) => (
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
                              {task.requiredVolunteers} волонтеров
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewMatches(task)}
                            disabled={matchLoading}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Мэтчи
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Формирование команд доступно волонтерам</p>
                        <p className="text-sm">Волонтеры могут приглашать друзей для совместной работы над задачами</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AdvancedAnalytics />
          </TabsContent>
        </Tabs>

        {/* Task Matches Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI-рекомендации для "{selectedTask?.title}"
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshMatches}
                  disabled={matchLoading}
                  className="ml-auto"
                >
                  {matchLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Обновление...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Обновить
                    </>
                  )}
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            {matchLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">AI ищет идеальных кандидатов...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    Найдено {matches.length} наиболее подходящих волонтеров
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
                
                {matches.map((match, index) => (
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
                            <h4 className="font-semibold">{match.profile?.name || 'Волонтер'}</h4>
                            <Badge className={`${
                              index === 0 ? 'bg-green-100 text-green-800 border-green-200' : 
                              index === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                              index === 2 ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {Math.round(match.score * 100)}% совпадение
                              {index === 0 && ' 🏆 Лучший мэтч'}
                              {index === 1 && ' 🥈 Второй мэтч'}
                              {index === 2 && ' 🥉 Третий мэтч'}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">{match.profile?.bio || 'Опытный волонтер'}</p>
                          
                          {/* Навыки волонтера */}
                          {match.profile?.skills && match.profile.skills.length > 0 && (
                            <div className="mb-3">
                              <span className="text-xs text-gray-500">Навыки:</span>
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
                              <div className="font-medium">{Math.floor(Math.random() * 20 + 5)} задач</div>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Рейтинг</span>
                              <div className="font-medium">⭐ {Math.floor(Math.random() * 2 + 3)}/5</div>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Надежность</span>
                              <div className="font-medium text-green-600">{Math.round(match.score * 100)}%</div>
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
                                toast({
                                  title: '📧 Приглашение отправлено',
                                  description: `${match.profile?.name} получит уведомление о задаче`,
                                });
                              }}
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              Пригласить
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: '💬 Чат открыт',
                                  description: `Начат чат с ${match.profile?.name}`,
                                });
                              }}
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Написать
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
                <Button variant="outline" onClick={() => setEditingTask(null)}>
                  Отмена
                </Button>
                <Button onClick={() => handleTaskUpdated(editingTask)}>
                  Сохранить изменения
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
