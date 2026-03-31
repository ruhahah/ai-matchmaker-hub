import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Check, 
  X, 
  Clock,
  Send,
  Search
} from 'lucide-react';
import { friendsService, type Friend, type TeamInvitation } from '@/lib/friendsService';
import { useToast } from '@/hooks/use-toast';

interface FriendsTeamInvitationProps {
  taskId: string;
  taskTitle: string;
  taskLocation: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export default function FriendsTeamInvitation({
  taskId,
  taskTitle,
  taskLocation,
  isOpen,
  onClose,
  currentUserId
}: FriendsTeamInvitationProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [invitationMessage, setInvitationMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && currentUserId) {
      loadFriends();
      loadTeamInvitations();
    }
  }, [isOpen, currentUserId]);

  const loadFriends = () => {
    try {
      const userFriends = friendsService.getFriends(currentUserId);
      setFriends(userFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список друзей',
        variant: 'destructive'
      });
    }
  };

  const loadTeamInvitations = () => {
    try {
      const invitations = friendsService.getTeamInvitations(currentUserId);
      setTeamInvitations(invitations);
    } catch (error) {
      console.error('Error loading team invitations:', error);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => {
      const newSet = new Set(prev);
      if (newSet.has(friendId)) {
        newSet.delete(friendId);
      } else {
        newSet.add(friendId);
      }
      return newSet;
    });
  };

  const sendInvitations = async () => {
    if (selectedFriends.size === 0) {
      toast({
        title: 'Внимание',
        description: 'Выберите хотя бы одного друга для приглашения',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const promises = Array.from(selectedFriends).map(friendId =>
        friendsService.sendTeamInvitation(
          currentUserId,
          friendId,
          taskId,
          taskTitle,
          invitationMessage || `Присоединяйся ко мне в задаче "${taskTitle}" в ${taskLocation}!`
        )
      );

      await Promise.all(promises);

      setSelectedFriends(new Set());
      setInvitationMessage('');
      loadTeamInvitations();

      toast({
        title: '✅ Приглашения отправлены!',
        description: `Отправлено приглашений: ${selectedFriends.size}`,
      });

      onClose();
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить приглашения',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      friendsService.acceptTeamInvitation(invitationId);
      loadTeamInvitations();
      toast({
        title: '✅ Принято!',
        description: 'Вы приняли приглашение в команду',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось принять приглашение',
        variant: 'destructive'
      });
    }
  };

  const rejectInvitation = async (invitationId: string) => {
    try {
      friendsService.rejectTeamInvitation(invitationId);
      loadTeamInvitations();
      toast({
        title: 'Отклонено',
        description: 'Вы отклонили приглашение в команду',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отклонить приглашение',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Собрать команду из друзей
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex gap-4 mt-4">
          {/* Friends List */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск друзей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Друзья не найдены</p>
                </div>
              ) : (
                filteredFriends.map(friend => (
                  <Card 
                    key={friend.id} 
                    className={`cursor-pointer transition-all ${
                      selectedFriends.has(friend.id) 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => toggleFriendSelection(friend.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={friend.avatar} alt={friend.name} />
                          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{friend.name}</h4>
                            <div className={`w-2 h-2 rounded-full ${
                              friend.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                          </div>
                          <p className="text-sm text-gray-600 truncate">{friend.bio}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
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
                        <div className="flex items-center">
                          {selectedFriends.has(friend.id) ? (
                            <Check className="w-5 h-5 text-blue-600" />
                          ) : (
                            <UserPlus className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Invitation Panel */}
          <div className="w-80 flex flex-col gap-4">
            {/* Selected Friends */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Выбрано друзей: {selectedFriends.size}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedFriends.size === 0 ? (
                  <p className="text-sm text-gray-500">Выберите друзей для приглашения</p>
                ) : (
                  Array.from(selectedFriends).map(friendId => {
                    const friend = friends.find(f => f.id === friendId);
                    return friend ? (
                      <div key={friendId} className="flex items-center gap-2 text-sm">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={friend.avatar} alt={friend.name} />
                          <AvatarFallback className="text-xs">{friend.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{friend.name}</span>
                      </div>
                    ) : null;
                  })
                )}
              </CardContent>
            </Card>

            {/* Message */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Сообщение приглашения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Добавьте личное сообщение..."
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  className="text-sm"
                />
              </CardContent>
            </Card>

            {/* Send Button */}
            <Button 
              onClick={sendInvitations}
              disabled={selectedFriends.size === 0 || loading}
              className="w-full"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Отправить приглашения
            </Button>

            {/* Team Invitations */}
            {teamInvitations.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Приглашения в команды ({teamInvitations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {teamInvitations.map(invitation => (
                    <div key={invitation.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{invitation.taskTitle}</p>
                          <p className="text-xs text-gray-600">От: {invitation.fromUserName}</p>
                          {invitation.message && (
                            <p className="text-xs text-gray-500 mt-1 italic">"{invitation.message}"</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acceptInvitation(invitation.id)}
                            className="h-8 px-2"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectInvitation(invitation.id)}
                            className="h-8 px-2"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
