import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Mail, 
  Calendar, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  Users,
  MessageCircle,
  Star,
  UserCheck,
  UserX
} from 'lucide-react';
import { demoDatabase, DemoProfile, VolunteerInvitation } from '@/lib/demoDatabaseFixed';

interface InvitationsManagerProps {
  currentUserId: string;
  onInvitationProcessed?: () => void;
}

export default function InvitationsManager({ currentUserId, onInvitationProcessed }: InvitationsManagerProps) {
  const [invitations, setInvitations] = useState<VolunteerInvitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<VolunteerInvitation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initialize demo database
    demoDatabase.initialize();
    
    // Load user's invitations
    loadInvitations();
  }, [currentUserId]);

  const loadInvitations = () => {
    const userInvitations = demoDatabase.getInvitationsForUser(currentUserId);
    setInvitations(userInvitations);
  };

  const handleAcceptInvitation = async (invitation: VolunteerInvitation) => {
    setIsProcessing(true);
    
    try {
      demoDatabase.respondToInvitation(invitation.id, 'accepted');
      
      toast({
        title: 'Приглашение принято!',
        description: `Вы приняли приглашение на задачу "${invitation.taskTitle}"`,
      });

      loadInvitations();
      
      if (onInvitationProcessed) {
        onInvitationProcessed();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось принять приглашение. Попробуйте еще раз.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setSelectedInvitation(null);
    }
  };

  const handleRejectInvitation = async (invitation: VolunteerInvitation) => {
    setIsProcessing(true);
    
    try {
      demoDatabase.respondToInvitation(invitation.id, 'rejected');
      
      toast({
        title: 'Приглашение отклонено',
        description: `Вы отклонили приглашение на задачу "${invitation.taskTitle}"`,
      });

      loadInvitations();
      
      if (onInvitationProcessed) {
        onInvitationProcessed();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отклонить приглашение. Попробуйте еще раз.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setSelectedInvitation(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Ожидает</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-100 text-green-800">Принято</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Отклонено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const processedInvitations = invitations.filter(inv => inv.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Новые приглашения ({pendingInvitations.length})
          </h3>
          
          <div className="space-y-3">
            {pendingInvitations.map(invitation => (
              <Card key={invitation.id} className="border-l-4 border-l-blue-500 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {invitation.inviterName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-medium">{invitation.inviterName}</h4>
                          <p className="text-sm text-gray-600">Приглашает вас на задачу</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div>
                          <h5 className="font-medium text-blue-900">{invitation.taskTitle}</h5>
                          <p className="text-sm text-gray-700 mt-1">{invitation.message}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(invitation.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptInvitation(invitation)}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Принять
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectInvitation(invitation)}
                          disabled={isProcessing}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Отклонить
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInvitation(invitation)}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processed Invitations */}
      {processedInvitations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-gray-600" />
            Обработанные приглашения ({processedInvitations.length})
          </h3>
          
          <div className="space-y-3">
            {processedInvitations.map(invitation => (
              <Card key={invitation.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                            {invitation.inviterName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-medium text-sm">{invitation.inviterName}</h4>
                          <p className="text-xs text-gray-600">Приглашение на задачу</p>
                        </div>
                        
                        <div className="ml-auto">
                          {getStatusBadge(invitation.status)}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div>
                          <h5 className="font-medium text-sm">{invitation.taskTitle}</h5>
                          <p className="text-xs text-gray-700">{invitation.message}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(invitation.createdAt)}
                          </div>
                          {invitation.respondedAt && (
                            <div className="flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              Ответ: {formatDate(invitation.respondedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Invitations */}
      {invitations.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">У вас нет приглашений</h3>
          <p className="text-sm text-gray-500">
            Когда друзья пригласят вас на задачи, они появятся здесь
          </p>
        </div>
      )}

      {/* Invitation Details Dialog */}
      <Dialog open={!!selectedInvitation} onOpenChange={() => setSelectedInvitation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Детали приглашения</DialogTitle>
          </DialogHeader>
          
          {selectedInvitation && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {selectedInvitation.inviterName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{selectedInvitation.inviterName}</h4>
                  <p className="text-sm text-gray-600">Организатор приглашения</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h5 className="font-medium text-blue-900">{selectedInvitation.taskTitle}</h5>
                  <p className="text-sm text-gray-700 mt-1">{selectedInvitation.message}</p>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(selectedInvitation.createdAt)}
                  </div>
                  {getStatusBadge(selectedInvitation.status)}
                </div>
              </div>
              
              {selectedInvitation.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleAcceptInvitation(selectedInvitation)}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Принять приглашение
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRejectInvitation(selectedInvitation)}
                    disabled={isProcessing}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Отклонить
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
