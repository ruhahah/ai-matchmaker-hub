import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, MapPin, Users, CheckCircle2, Clock, Eye, Bot } from 'lucide-react';
import { getTasks, getProfiles, aiSemanticMatching, type Task, type Profile, type MatchingResult } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import AiTaskCreator from '@/components/AiTaskCreator';
import AISquadSuggestions from '@/components/AISquadSuggestions';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';

export default function OrganizerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [matches, setMatches] = useState<(MatchingResult & { profile?: Profile })[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState('create');

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

  const handleViewMatches = async (task: Task) => {
    setSelectedTask(task);
    setMatchLoading(true);
    try {
      const matches = await aiSemanticMatching(task.id, []);
      const matchesWithProfiles = matches.map(match => ({
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
                      <AISquadSuggestions 
                        task={task}
                        onInvite={(volunteerId) => {
                          toast({
                            title: '✅ Приглашение отправлено!',
                            description: 'Волонтер добавлен в команду',
                          });
                        }}
                      />
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
              </DialogTitle>
            </DialogHeader>
            
            {matchLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">AI ищет идеальных кандидатов...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🤷‍♂️</div>
                    <p className="text-gray-600">Подходящих волонтеров пока не найдено</p>
                  </div>
                ) : (
                  matches.map((match, index) => (
                    <Card key={match.volunteerId} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{match.profile?.name}</h4>
                              <Badge className="bg-blue-100 text-blue-800">
                                {Math.round(match.score * 100)}% совпадение
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-3">{match.profile?.bio}</p>
                            
                            {match.reason && (
                              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Sparkles className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">Почему рекомендуем:</span>
                                </div>
                                <p className="text-blue-800 text-sm">{match.reason}</p>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-1">
                              {match.profile?.skills.map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <Button className="ml-4" onClick={() => handleInviteVolunteer(match)}>
                            <Users className="w-4 h-4 mr-1" />
                            Пригласить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
