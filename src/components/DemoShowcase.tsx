import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { initializeDemoData, getDemoVolunteers, getDemoTasks, getDemoVisionResults, getDemoFriendInvitations } from '@/lib/demoData';
import { Camera, Users, CheckCircle, Clock, Send, Award, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function DemoShowcase() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [visionResults, setVisionResults] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showVisionDemo, setShowVisionDemo] = useState(false);

  useEffect(() => {
    // Инициализируем демо-данные
    initializeDemoData();
    
    // Загружаем данные
    setVolunteers(getDemoVolunteers());
    setTasks(getDemoTasks());
    setVisionResults(getDemoVisionResults());
    setInvitations(getDemoFriendInvitations());
  }, []);

  const handleVisionVerification = (taskId: string) => {
    setShowVisionDemo(true);
    setSelectedTask(tasks.find(t => t.id === taskId));
    
    // Имитация верификации через 2 секунды
    setTimeout(() => {
      const result = visionResults.find(r => r.taskId === taskId);
      if (result) {
        toast({
          title: "✅ Верификация завершена",
          description: result.reason,
        });
      }
    }, 2000);
  };

  const handleInviteFriend = (taskId: string, volunteerId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const volunteer = volunteers.find(v => v.id === volunteerId);
    
    toast({
      title: "📨 Приглашение отправлено",
      description: `${volunteer.name} приглашен на задачу "${task.title}"`,
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Заголовок */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">AI Matchmaker Hub - Демо</h1>
        <p className="text-lg text-gray-600">Демонстрация Vision API и системы приглашения друзей</p>
      </div>

      {/* Секция Vision API */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold">🔍 Vision API Верификация</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.filter(t => t.status === 'in_progress').map(task => (
            <Card key={task.id} className="border-2 border-blue-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <Badge className={`${getStatusColor(task.status)} text-white`}>
                    {task.status === 'in_progress' ? 'В процессе' : task.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">{task.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>Нужно: {task.requiredVolunteers} волонтеров</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(task.startTime).toLocaleDateString('ru-RU')}</span>
                </div>
                <Button 
                  onClick={() => handleVisionVerification(task.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  📸 Верифицировать выполнение
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {showVisionDemo && selectedTask && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Результат верификации
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400" />
                  <span className="ml-2 text-gray-500">Демо фото задачи</span>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Статус:</span>
                    <Badge className="bg-green-500 text-white">Подтверждено</Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Уверенность:</span>
                    <span className="text-green-600 font-bold">95%</span>
                  </div>
                  <div>
                    <span className="font-semibold">Комментарий AI:</span>
                    <p className="text-sm text-gray-600 mt-1">
                      Фото подтверждает выполнение работ по уборке парка. Видно собранные мешки с мусором и чистая территория. Задача выполнена качественно.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Секция приглашения друзей */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-semibold">👥 Приглашение друзей на задачи</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Активные задачи */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">📋 Активные задачи</h3>
            {tasks.filter(t => t.status === 'open').map(task => (
              <Card key={task.id} className="border-2 border-purple-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{task.title}</CardTitle>
                    <Badge className={`${getUrgencyColor(task.urgency)} text-white`}>
                      {task.urgency === 'high' ? 'Срочно' : task.urgency === 'medium' ? 'Средне' : 'Низко'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{task.requiredVolunteers} чел.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(task.startTime).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {task.skills.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Волонтеры для приглашения */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🤝 Пригласить волонтеров</h3>
            {volunteers.map(volunteer => (
              <Card key={volunteer.id} className="border-2 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={volunteer.avatar} alt={volunteer.name} />
                      <AvatarFallback>{volunteer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-semibold">{volunteer.name}</h4>
                        <p className="text-sm text-gray-600">{volunteer.bio}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {volunteer.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleInviteFriend('task-1', volunteer.id)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          На экол. акцию
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleInviteFriend('task-3', volunteer.id)}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          На IT-урок
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* История приглашений */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              📨 Последние приглашения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map(invitation => {
                const task = tasks.find(t => t.id === invitation.taskId);
                const volunteer = volunteers.find(v => v.id === invitation.inviterId);
                
                return (
                  <div key={invitation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={volunteer?.avatar} alt={volunteer?.name} />
                        <AvatarFallback>{volunteer?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{volunteer?.name}</p>
                        <p className="text-xs text-gray-600">{invitation.message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={invitation.status === 'accepted' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {invitation.status === 'accepted' ? 'Принято' : 'Ожидает'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(invitation.timestamp).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
