import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ResponseNotification } from '@/types/responses';
import { responsesDatabase } from '@/lib/responsesService';
import {
  Bell,
  UserPlus,
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  MessageSquare,
  X,
  Target,
  Star,
  Calendar
} from 'lucide-react';

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  userRole: 'organizer' | 'volunteer';
  userId: string;
}

export default function NotificationsPanel({ open, onClose, userRole, userId }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<ResponseNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, userRole, userId]);

  const loadNotifications = () => {
    const allNotifications = userRole === 'organizer' 
      ? responsesDatabase.getNotificationsForOrganizer(userId)
      : responsesDatabase.getNotificationsForVolunteer(userId);
    
    setNotifications(allNotifications);
    setUnreadCount(responsesDatabase.getUnreadCount(userId, userRole));
  };

  const markAsRead = (notificationId: string) => {
    responsesDatabase.markNotificationAsRead(notificationId);
    loadNotifications();
  };

  const markAllAsRead = () => {
    notifications.forEach(notif => {
      if (!notif.read) {
        responsesDatabase.markNotificationAsRead(notif.id);
      }
    });
    loadNotifications();
  };

  const getNotificationIcon = (type: ResponseNotification['type']) => {
    switch (type) {
      case 'new_response':
        return <UserPlus className="w-5 h-5 text-blue-600" />;
      case 'response_accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'response_rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'response_withdrawn':
        return <RotateCcw className="w-5 h-5 text-gray-600" />;
      case 'task_assigned':
        return <Target className="w-5 h-5 text-purple-600" />;
      case 'task_completed':
        return <Star className="w-5 h-5 text-yellow-600" />;
      case 'new_task_available':
        return <Calendar className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: ResponseNotification['type'], read: boolean) => {
    if (read) return 'bg-white';
    
    switch (type) {
      case 'new_response':
        return 'bg-blue-50 border-blue-200';
      case 'response_accepted':
        return 'bg-green-50 border-green-200';
      case 'response_rejected':
        return 'bg-red-50 border-red-200';
      case 'response_withdrawn':
        return 'bg-gray-50 border-gray-200';
      case 'task_assigned':
        return 'bg-purple-50 border-purple-200';
      case 'task_completed':
        return 'bg-yellow-50 border-yellow-200';
      case 'new_task_available':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-white';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} д назад`;
    
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-16">
      <div className="bg-white w-full max-w-md h-[600px] shadow-xl">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Уведомления
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount}</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={markAllAsRead}
                >
                  Отметить все как прочитанные
                </Button>
              )}
              <Button 
                size="sm" 
                variant="ghost"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 h-[calc(100%-80px)]">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Нет уведомлений</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        getNotificationColor(notification.type, notification.read)
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm truncate">
                              {notification.taskTitle}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {notification.volunteerName}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatTime(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
