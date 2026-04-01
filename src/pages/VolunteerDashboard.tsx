import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, MapPin, CheckCircle2, XCircle, Camera, Send, Upload, Clock, AlertCircle, Target, Star, TrendingUp, Bot, User, Users, Bell, Calendar, Award, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { demoDatabase } from '@/lib/demoDatabase';
import { friendsService } from '@/lib/friendsService';
import { responsesDatabase } from '@/lib/responsesService';
import AIImpactSummary from '@/components/AIImpactSummary';
import ImpactCertificate from '@/components/ImpactCertificate';
import RAGTaskConsultant from '@/components/RAGTaskConsultant';
import FriendsManagement from '@/components/FriendsManagement';
import NotificationsPanel from '@/components/NotificationsPanel';
import UserSkillsManager from '@/components/UserSkillsManager';

interface Task {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  status: string;
  urgency: 'low' | 'medium' | 'high';
  requiredVolunteers: number;
  startTime: string;
  creatorId: string;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  bio: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen?: string;
}

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [appliedTasks, setAppliedTasks] = useState<Set<string>>(new Set());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [friendsManagementOpen, setFriendsManagementOpen] = useState(false);
  const [skillsManagerOpen, setSkillsManagerOpen] = useState(false);
  const [ragConsultantOpen, setRagConsultantOpen] = useState(false);
  const [ragTask, setRagTask] = useState<Task | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем задачи
      const allTasks = demoDatabase.getTasks();
      const availableTasks = allTasks.filter(task => task.status === 'open');
      setTasks(availableTasks);

      // Загружаем текущего пользователя
      const profiles = demoDatabase.getProfiles();
      const volunteer = profiles.find(p => p.role === 'volunteer' && p.id === 'current-user');
      setCurrentUser(volunteer || profiles[0]); // Fallback to first volunteer

      // Загружаем друзей
      if (volunteer) {
        const friendList = friendsService.getFriends(volunteer.id);
        setFriends(friendList);
      }

      // Загружаем отклики пользователя
      if (volunteer) {
        const responses = responsesDatabase.getNotificationsForVolunteer(volunteer.id);
        const appliedIds = new Set(
          responses
            .filter(r => r.type === 'response_accepted')
            .map(r => r.taskId)
        );
        setAppliedTasks(appliedIds);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTask = (taskId: string) => {
    if (!currentUser) {
      toast({
        title: 'Ошибка',
        description: 'Сначала войдите в систему',
        variant: 'destructive'
      });
      return;
    }

    // Создаем отклик на задачу
    const response = responsesDatabase.createResponse({
      taskId,
      volunteerId: currentUser.id,
      volunteerName: currentUser.name,
      volunteerEmail: currentUser.email,
      volunteerAvatar: currentUser.avatar,
      status: 'pending',
      message: 'Хочу принять участие в этой задаче!',
      matchingScore: 0.85,
      hardSkills: currentUser.skills || [],
      softSkills: [],
      experience: 'Активный волонтер',
      availability: 'flexible',
      motivation: 'Хочу помогать сообществу'
    });

    setAppliedTasks(prev => new Set(prev).add(taskId));
    
    toast({
      title: 'Отклик отправлен!',
      description: 'Вы откликнулись на задачу. Ожидайте ответа организатора.',
    });
  };

  const openRAGConsultant = (task: Task) => {
    setRagTask(task);
    setRagConsultantOpen(true);
  };

  const closeRAGConsultant = () => {
    setRagConsultantOpen(false);
    setRagTask(null);
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex flex-col items-center gap-3 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* AI Impact Summary */}
      {currentUser && (
        <AIImpactSummary volunteerId={currentUser.id} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Панель волонтера</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Найдите подходящие задачи и помогайте сообществу
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setNotificationsOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Уведомления
          </Button>
          <Button 
            onClick={() => setFriendsManagementOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Друзья
          </Button>
          <Button 
            onClick={() => navigate('/volunteer/profile')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Мой профиль
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Задачи
            <Badge variant="secondary" className="text-xs">
              {tasks.filter(t => !appliedTasks.has(t.id)).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="applied" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Мои отклики
            <Badge variant="secondary" className="text-xs">
              {appliedTasks.size}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Друзья
            <Badge variant="secondary" className="text-xs">
              {friends.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Лента
          </TabsTrigger>
        </TabsList>

        {/* Available Tasks */}
        <TabsContent value="tasks" className="space-y-4">
          {tasks.filter(task => !appliedTasks.has(task.id)).length === 0 ? (
            <div className="text-center py-16">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">Нет доступных задач</p>
              <p className="text-sm text-gray-500">Проверьте позже или обновите навыки в профиле</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tasks.filter(task => !appliedTasks.has(task.id)).map((task, i) => (
                <Card
                  key={task.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
                  onClick={() => setSelectedTask(task)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-semibold">{task.title}</h3>
                          <Badge 
                            variant={task.urgency === 'high' ? 'destructive' : 
                                   task.urgency === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {task.urgency === 'high' ? 'Срочно' : 
                             task.urgency === 'medium' ? 'Средне' : 'Низко'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {task.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          Нужно: {task.requiredVolunteers} волонтеров
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.startTime}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {task.skills.map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyTask(task.id);
                        }}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Откликнуться
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRAGConsultant(task);
                        }}
                      >
                        <Bot className="w-4 h-4 mr-1" />
                        AI
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Applied Tasks */}
        <TabsContent value="applied" className="space-y-4">
          {appliedTasks.size === 0 ? (
            <div className="text-center py-16">
              <Send className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">У вас пока нет откликов</p>
              <p className="text-sm text-gray-500">Откликнитесь на задачи, чтобы увидеть их здесь</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tasks.filter(task => appliedTasks.has(task.id)).map((task, i) => (
                <Card key={task.id} className="border-green-200 bg-green-50/50">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-semibold">{task.title}</h3>
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Отклик отправлен
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {task.location}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Ожидайте ответа от организатора
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Friends */}
        <TabsContent value="friends" className="space-y-4">
          {friends.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">У вас пока нет друзей</p>
              <p className="text-sm text-gray-500 mb-4">Приглашайте друзей для совместной работы над задачами!</p>
              <Button onClick={() => setFriendsManagementOpen(true)}>
                Найти друзей
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {friends.map((friend, i) => (
                <Card key={friend.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={friend.avatar} 
                        alt={friend.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{friend.name}</h3>
                        <p className="text-sm text-muted-foreground">{friend.bio}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            friend.status === 'online' ? 'bg-green-500' :
                            friend.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                          {friend.status === 'online' ? 'Онлайн' :
                           friend.status === 'busy' ? 'Занят' : 'Офлайн'}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {friend.skills.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {friend.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{friend.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`w-2 h-2 rounded-full ${
                          friend.status === 'online' ? 'bg-green-500' :
                          friend.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                        <div className="text-xs text-muted-foreground mt-1">
                          {friend.status === 'online' ? 'Онлайн' :
                           friend.status === 'busy' ? 'Занят' : 'Офлайн'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Discovery Feed */}
        <TabsContent value="feed" className="space-y-4">
          <div className="text-center py-8">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-2">Лента активности</p>
            <p className="text-sm text-gray-500">Скоро здесь появится активность ваших друзей</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Detail Modal */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selectedTask?.description}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {selectedTask?.location}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3 w-3" /> Нужно: {selectedTask?.requiredVolunteers} волонтеров
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedTask?.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
            
            {selectedTask && !appliedTasks.has(selectedTask.id) && (
              <Button 
                onClick={() => handleApplyTask(selectedTask.id)} 
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Откликнуться на задачу
              </Button>
            )}
            
            {selectedTask && appliedTasks.has(selectedTask.id) && (
              <div className="text-center py-4 text-green-600">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                Вы уже откликнулись на эту задачу
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* RAG Task Consultant */}
      {ragTask && (
        <RAGTaskConsultant
          task={ragTask}
          isOpen={ragConsultantOpen}
          onClose={closeRAGConsultant}
        />
      )}

      {/* Friends Management */}
      {friendsManagementOpen && currentUser && (
        <FriendsManagement
          isOpen={friendsManagementOpen}
          onClose={() => setFriendsManagementOpen(false)}
          currentUserId={currentUser.id}
        />
      )}

      {/* Notifications Panel */}
      <NotificationsPanel 
        open={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)}
        userRole="volunteer"
        userId={currentUser?.id || 'vol-1'}
      />
    </div>
  );
}
