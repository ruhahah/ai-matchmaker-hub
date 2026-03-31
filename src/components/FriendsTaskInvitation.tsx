import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Send, 
  Search, 
  Clock,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  UserCheck
} from 'lucide-react';
import { demoDatabase, DemoProfile, DemoTask } from '@/lib/demoDatabaseFixed';

interface FriendsTaskInvitationProps {
  task: DemoTask;
  currentUserId: string;
  onInvitationSent?: () => void;
}

export default function FriendsTaskInvitation({ task, currentUserId, onInvitationSent }: FriendsTaskInvitationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<DemoProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [invitationMessage, setInvitationMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentInvitations, setSentInvitations] = useState<string[]>([]);

  useEffect(() => {
    // Initialize demo database
    demoDatabase.initialize();
    
    // Load current user's friends
    const currentUser = demoDatabase.getUserById(currentUserId);
    if (currentUser) {
      const friendsList = currentUser.friends
        .map(friendId => demoDatabase.getUserById(friendId))
        .filter(Boolean) as DemoProfile[];
      setFriends(friendsList);
    }

    // Load existing invitations for this task
    const existingInvitations = demoDatabase.getInvitationsForTask(task.id);
    const invitedFriendIds = existingInvitations
      .filter(inv => inv.status === 'pending' || inv.status === 'accepted')
      .map(inv => inv.inviteeId);
    setSentInvitations(invitedFriendIds);
  }, [currentUserId, task.id]);

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSendInvitations = async () => {
    if (selectedFriends.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите хотя бы одного друга для приглашения',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    try {
      // Send invitations to selected friends
      for (const friendId of selectedFriends) {
        const invitation = demoDatabase.createInvitation(
          task.id,
          currentUserId,
          friendId,
          invitationMessage || `Привет! Приглашаю тебя на задачу "${task.title}". Будет здорово поработать вместе!`
        );
      }

      // Update task's invited friends list
      const currentTask = demoDatabase.getTaskById(task.id);
      if (currentTask) {
        demoDatabase.updateTask(task.id, {
          invitedFriends: [...currentTask.invitedFriends, ...selectedFriends]
        });
      }

      setSentInvitations(prev => [...prev, ...selectedFriends]);
      setSelectedFriends([]);
      setInvitationMessage('');
      
      toast({
        title: 'Приглашения отправлены!',
        description: `Отправлено ${selectedFriends.length} приглашений на задачу "${task.title}"`,
      });

      if (onInvitationSent) {
        onInvitationSent();
      }

      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить приглашения. Попробуйте еще раз.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const isFriendInvited = (friendId: string) => {
    return sentInvitations.includes(friendId);
  };

  const canInviteMore = task.maxFriends ? 
    sentInvitations.length < task.maxFriends : 
    true;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={!canInviteMore}
        >
          <Users className="w-4 h-4" />
          Пригласить друзей
          {task.maxFriends && (
            <Badge variant="secondary" className="ml-1">
              {sentInvitations.length}/{task.maxFriends}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Пригласить друзей на задачу
          </DialogTitle>
        </DialogHeader>

        {/* Task Info */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{task.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              {task.location}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {task.startTime}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              Нужно волонтеров: {task.requiredVolunteers}
            </div>
            {task.skills && task.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Поиск друзей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Friends List */}
        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Друзья не найдены</p>
              <p className="text-sm">Попробуйте изменить поисковый запрос</p>
            </div>
          ) : (
            filteredFriends.map(friend => {
              const isInvited = isFriendInvited(friend.id);
              const isSelected = selectedFriends.includes(friend.id);
              
              return (
                <Card 
                  key={friend.id} 
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  } ${isInvited ? 'opacity-60' : ''}`}
                  onClick={() => !isInvited && handleFriendToggle(friend.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={friend.avatar} alt={friend.name} />
                          <AvatarFallback>
                            {friend.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{friend.name}</h4>
                            {isInvited && (
                              <Badge variant="secondary" className="text-xs">
                                Приглашен
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{friend.bio}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {friend.stats.rating} рейтинг
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {friend.stats.tasksCompleted} задач
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {friend.stats.hoursVolunteered} часов
                            </div>
                          </div>
                          
                          {friend.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {friend.skills.slice(0, 3).map(skill => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {friend.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{friend.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isInvited ? (
                          <div className="text-green-600">
                            <UserCheck className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className={`w-5 h-5 rounded border-2 ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <div className="w-full h-full flex items-center justify-center text-white text-xs">
                                ✓
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Invitation Message */}
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium">Сообщение друзьям (необязательно)</label>
          <Textarea
            placeholder="Добавьте личное сообщение к приглашению..."
            value={invitationMessage}
            onChange={(e) => setInvitationMessage(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedFriends.length > 0 && (
              <span>Выбрано друзей: {selectedFriends.length}</span>
            )}
            {task.maxFriends && (
              <span className="ml-2">
                (Лимит: {sentInvitations.length}/{task.maxFriends})
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleSendInvitations}
              disabled={selectedFriends.length === 0 || isSending || !canInviteMore}
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Отправить приглашения
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
