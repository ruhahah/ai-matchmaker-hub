import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Response, 
  ResponseStats, 
  ResponseFilters, 
  ResponseNotification 
} from '@/types/responses';
import { responsesDatabase } from '@/lib/responsesService';
import {
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Star,
  Calendar,
  MapPin,
  Award,
  Filter,
  Bell,
  Eye
} from 'lucide-react';

interface ResponsesManagerProps {
  taskId: string;
  taskTitle: string;
}

export default function ResponsesManager({ taskId, taskTitle }: ResponsesManagerProps) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [stats, setStats] = useState<ResponseStats | null>(null);
  const [filters, setFilters] = useState<ResponseFilters>({
    status: 'all',
    skills: [],
    experience: 'all',
    availability: 'all'
  });
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [notifications, setNotifications] = useState<ResponseNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadResponses();
    loadNotifications();
  }, [taskId]);

  const loadResponses = () => {
    const allResponses = responsesDatabase.getTaskResponses(taskId);
    const filteredResponses = responsesDatabase.filterResponses(allResponses, filters);
    setResponses(filteredResponses);
    
    const taskStats = responsesDatabase.getTaskResponseStats(taskId);
    setStats(taskStats);
  };

  const loadNotifications = () => {
    const allNotifications = responsesDatabase.getNotificationsForOrganizer('org-1');
    setNotifications(allNotifications);
    setUnreadCount(responsesDatabase.getUnreadCount('org-1'));
  };

  const handleStatusUpdate = (responseId: string, status: Response['status']) => {
    if (status === 'accepted' || status === 'rejected') {
      setSelectedResponse(responses.find(r => r.id === responseId) || null);
      setReviewDialogOpen(true);
    } else {
      const updated = responsesDatabase.updateResponseStatus(responseId, status);
      if (updated) {
        loadResponses();
        toast({
          title: 'Статус обновлен',
          description: `Отлик ${status === 'withdrawn' ? 'отозван' : 'обновлен'}`,
        });
      }
    }
  };

  const handleReviewSubmit = () => {
    if (!selectedResponse) return;

    const status = reviewMessage.includes('принять') || reviewMessage.includes('отлично') ? 'accepted' : 'rejected';
    const updated = responsesDatabase.updateResponseStatus(
      selectedResponse.id, 
      status, 
      reviewMessage, 
      'org-1'
    );

    if (updated) {
      loadResponses();
      loadNotifications();
      setReviewDialogOpen(false);
      setReviewMessage('');
      setSelectedResponse(null);
      
      toast({
        title: status === 'accepted' ? 'Отлик принят' : 'Отлик отклонен',
        description: `${selectedResponse.volunteerName} получил уведомление`,
      });
    }
  };

  const getStatusColor = (status: Response['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Response['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'withdrawn': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Всего откликов</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Ожидают</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
              <div className="text-sm text-gray-600">Приняты</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Отклонены</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.withdrawn}</div>
              <div className="text-sm text-gray-600">Отозваны</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <Select 
              value={filters.status} 
              onValueChange={(value) => {
                setFilters(prev => ({ ...prev, status: value as any }));
                loadResponses();
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
              value={filters.experience} 
              onValueChange={(value) => {
                setFilters(prev => ({ ...prev, experience: value as any }));
                loadResponses();
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

            <Select 
              value={filters.availability} 
              onValueChange={(value) => {
                setFilters(prev => ({ ...prev, availability: value as any }));
                loadResponses();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Доступность" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любая</SelectItem>
                <SelectItem value="immediate">Немедленно</SelectItem>
                <SelectItem value="flexible">Гибкая</SelectItem>
                <SelectItem value="weekends">Выходные</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              placeholder="Поиск по навыкам..."
              onChange={(e) => {
                const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                setFilters(prev => ({ ...prev, skills }));
                loadResponses();
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Список откликов */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Отклики на задачу "{taskTitle}"</span>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount}</Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {responses.map(response => (
                <Card key={response.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar>
                          <AvatarImage src={response.volunteerAvatar} />
                          <AvatarFallback>
                            {response.volunteerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{response.volunteerName}</h3>
                            <Badge className={getStatusColor(response.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(response.status)}
                                {response.status === 'pending' && 'Ожидает'}
                                {response.status === 'accepted' && 'Принят'}
                                {response.status === 'rejected' && 'Отклонен'}
                                {response.status === 'withdrawn' && 'Отозван'}
                              </div>
                            </Badge>
                            {response.matchingScore && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm">{Math.round(response.matchingScore * 100)}%</span>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-700">{response.message}</p>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Опыт:</span>
                              <p className="text-gray-600">{response.experience}</p>
                            </div>
                            <div>
                              <span className="font-medium">Доступность:</span>
                              <p className="text-gray-600">{response.availability}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className="font-medium text-sm">Hard Skills:</span>
                              <div className="flex gap-1 mt-1">
                                {response.hardSkills.map(skill => (
                                  <Badge key={skill} variant="secondary" className="text-xs bg-blue-50">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-sm">Soft Skills:</span>
                              <div className="flex gap-1 mt-1">
                                {response.softSkills.map(skill => (
                                  <Badge key={skill} variant="secondary" className="text-xs bg-green-50">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500">
                            Отклик: {formatDate(response.appliedAt)}
                            {response.reviewedAt && (
                              <span> • Обзор: {formatDate(response.reviewedAt)}</span>
                            )}
                          </div>

                          {response.reviewMessage && (
                            <div className="bg-gray-50 p-2 rounded text-sm">
                              <span className="font-medium">Комментарий:</span> {response.reviewMessage}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {response.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(response.id, 'accepted')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Принять
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleStatusUpdate(response.id, 'rejected')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Отклонить
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Профиль
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {responses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Нет откликов</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Диалог обзора отклика */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Обзор отклика</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedResponse && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">{selectedResponse.volunteerName}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedResponse.message}</p>
              </div>
            )}
            
            <Textarea
              placeholder="Напишите комментарий для волонтера..."
              value={reviewMessage}
              onChange={(e) => setReviewMessage(e.target.value)}
              rows={4}
            />
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setReviewDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button onClick={handleReviewSubmit}>
                Отправить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
