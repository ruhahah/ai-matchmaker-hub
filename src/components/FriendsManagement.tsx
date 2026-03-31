import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Check, 
  X, 
  Clock,
  Search,
  UserCheck
} from 'lucide-react';
import { friendsService, type Friend, type FriendRequest } from '@/lib/friendsService';
import { useToast } from '@/hooks/use-toast';

interface FriendsManagementProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export default function FriendsManagement({
  isOpen,
  onClose,
  currentUserId
}: FriendsManagementProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [allVolunteers, setAllVolunteers] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && currentUserId) {
      loadFriends();
      loadFriendRequests();
      loadAllVolunteers();
    }
  }, [isOpen, currentUserId]);

  const loadFriends = () => {
    try {
      const userFriends = friendsService.getFriends(currentUserId);
      setFriends(userFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadFriendRequests = () => {
    try {
      const requests = friendsService.getFriendRequests(currentUserId);
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const loadAllVolunteers = () => {
    try {
      const allFriends = friendsService.getFriends(currentUserId);
      setAllVolunteers(allFriends);
    } catch (error) {
      console.error('Error loading volunteers:', error);
    }
  };

  const sendFriendRequest = async (toUserId: string) => {
    setLoading(true);
    try {
      await friendsService.sendFriendRequest(currentUserId, toUserId);
      loadFriendRequests();
      toast({
        title: '✅ Запрос отправлен!',
        description: 'Запрос в друзья отправлен успешно',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить запрос в друзья',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      friendsService.acceptFriendRequest(requestId);
      loadFriends();
      loadFriendRequests();
      toast({
        title: '✅ Принято!',
        description: 'Теперь вы друзья!',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось принять запрос в друзья',
        variant: 'destructive'
      });
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      friendsService.rejectFriendRequest(requestId);
      loadFriendRequests();
      toast({
        title: 'Отклонено',
        description: 'Запрос в друзья отклонен',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отклонить запрос',
        variant: 'destructive'
      });
    }
  };

  const filteredVolunteers = allVolunteers.filter(volunteer =>
    volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    volunteer.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const incomingRequests = friendRequests.filter(req => req.toUserId === currentUserId);
  const outgoingRequests = friendRequests.filter(req => req.fromUserId === currentUserId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Управление друзьями
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 mt-4">
          <Tabs defaultValue="friends" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Мои друзья ({friends.length})
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Запросы ({incomingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="find" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Найти друзей
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="flex-1 mt-4">
              <div className="h-full overflow-y-auto space-y-2">
                {friends.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>У вас пока нет друзей</p>
                    <p className="text-sm">Найдите волонтеров во вкладке "Найти друзей"</p>
                  </div>
                ) : (
                  friends.map(friend => (
                    <Card key={friend.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={friend.avatar} alt={friend.name} />
                            <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{friend.name}</h4>
                              <div className={`w-3 h-3 rounded-full ${
                                friend.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                            </div>
                            <p className="text-sm text-gray-600">{friend.bio}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {friend.skills.map(skill => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Написать
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="requests" className="flex-1 mt-4">
              <div className="space-y-4">
                {/* Incoming Requests */}
                {incomingRequests.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Входящие запросы ({incomingRequests.length})
                    </h4>
                    <div className="space-y-2">
                      {incomingRequests.map(request => (
                        <Card key={request.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{request.fromUserName} хочет добавить вас в друзья</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(request.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => acceptFriendRequest(request.id)}
                                  className="h-8 px-3"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Принять
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => rejectFriendRequest(request.id)}
                                  className="h-8 px-3"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Отклонить
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Outgoing Requests */}
                {outgoingRequests.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Исходящие запросы ({outgoingRequests.length})
                    </h4>
                    <div className="space-y-2">
                      {outgoingRequests.map(request => (
                        <Card key={request.id} className="opacity-75">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Вы отправили запрос {request.toUserName}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(request.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                Ожидает ответа
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>У вас нет запросов в друзья</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="find" className="flex-1 mt-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск волонтеров..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="h-full overflow-y-auto space-y-2">
                  {filteredVolunteers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Волонтеры не найдены</p>
                    </div>
                  ) : (
                    filteredVolunteers.map(volunteer => (
                      <Card key={volunteer.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={volunteer.avatar} alt={volunteer.name} />
                              <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{volunteer.name}</h4>
                                <div className={`w-3 h-3 rounded-full ${
                                  volunteer.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                              </div>
                              <p className="text-sm text-gray-600">{volunteer.bio}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {volunteer.skills.slice(0, 3).map(skill => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {volunteer.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{volunteer.skills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendFriendRequest(volunteer.id)}
                              disabled={loading}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Добавить в друзья
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
