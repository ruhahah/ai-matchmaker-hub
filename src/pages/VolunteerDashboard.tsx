import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, MapPin, CheckCircle2, XCircle, Camera, Send, Upload, Clock, AlertCircle } from 'lucide-react';
import { aiTaskRecommendations, aiVisionVerify, getProfiles, getPendingInvitations, acceptInvitationAndApply, respondToInvitation, type TaskRecommendation, type VisionResult, type VolunteerInvitation } from '@/lib/mockApi';
import AIImpactSummary from '@/components/AIImpactSummary';
import { useToast } from '@/hooks/use-toast';
import TaskAssistantChat from '@/components/TaskAssistantChat';

interface RecommendedTask {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  status: string;
  score: number;
  reason: string;
  startTime?: string;
  requiredVolunteers?: number;
  urgency?: 'low' | 'medium' | 'high';
}

export default function VolunteerDashboard() {
  const [tasks, setTasks] = useState<RecommendedTask[]>([]);
  const [invitations, setInvitations] = useState<VolunteerInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [volunteerId, setVolunteerId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<RecommendedTask | null>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<VolunteerInvitation | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [verifying, setVerifying] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [respondingToInvitation, setRespondingToInvitation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const profiles = await getProfiles('volunteer');
        if (!profiles[0]?.id) {
          setLoading(false);
          return;
        }

        const volId = profiles[0].id;
        setVolunteerId(volId);

        // Load both recommendations and urgent invitations
        const [recommendations, pendingInvitations] = await Promise.all([
          aiTaskRecommendations(volId),
          getPendingInvitations(volId)
        ]);

        const recommended: RecommendedTask[] = recommendations
          .filter(r => r.score > 0.4)
          .map(r => ({
            id: r.taskId,
            title: r.title,
            description: r.description,
            skills: r.skills || [],
            location: r.location || '',
            status: r.status,
            score: r.score,
            reason: r.reason,
          }));

        setTasks(recommended);
        setInvitations(pendingInvitations);
        setLoading(false);
      } catch (err) {
        console.error('Dashboard loading error:', err);
        setLoading(false);
      }
    })();
  }, []);

  const handleApply = (taskId: string) => {
    setApplied(prev => new Set(prev).add(taskId));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please select an image under 5MB.',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix
        setSelectedPhoto(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async (taskId: string) => {
    if (!selectedPhoto) {
      toast({
        title: 'No photo selected',
        description: 'Please upload a photo of your completed work.',
        variant: 'destructive',
      });
      return;
    }

    setVerifying(true);
    setVisionResult(null);
    try {
      const result = await aiVisionVerify(taskId, selectedPhoto);
      setVisionResult(result);
      
      // If approved, update task status in UI
      if (result.status === 'approved') {
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, status: 'completed' }
            : task
        ));
        
        toast({
          title: 'Task Completed! 🎉',
          description: 'Your work has been verified and approved by AI.',
        });
        
        // Close modal after successful verification
        setTimeout(() => {
          setSelectedTask(null);
          setSelectedPhoto(null);
          setVisionResult(null);
        }, 2000);
      } else {
        toast({
          title: 'Verification Failed',
          description: result.reason,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Verification failed',
        description: err.message || 'Failed to verify photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleAcceptInvitation = async (invitation: VolunteerInvitation) => {
    setRespondingToInvitation(true);
    try {
      const profiles = await getProfiles('volunteer');
      const volunteerId = profiles[0]?.id;
      
      if (!volunteerId) {
        toast({
          title: 'Error',
          description: 'Volunteer profile not found',
          variant: 'destructive',
        });
        return;
      }

      await acceptInvitationAndApply(invitation.id, invitation.task_id, volunteerId);
      
      // Remove invitation from list
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      
      // Add to applied tasks
      setApplied(prev => new Set(prev).add(invitation.task_id));
      
      toast({
        title: 'Invitation Accepted! 🎉',
        description: 'You have been applied to the task successfully.',
      });
      
      setSelectedInvitation(null);
    } catch (err: any) {
      toast({
        title: 'Failed to accept invitation',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRespondingToInvitation(false);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    setRespondingToInvitation(true);
    try {
      await respondToInvitation(invitationId, 'rejected');
      
      // Remove invitation from list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      toast({
        title: 'Invitation Declined',
        description: 'You have declined this invitation.',
      });
      
      setSelectedInvitation(null);
    } catch (err: any) {
      toast({
        title: 'Failed to decline invitation',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRespondingToInvitation(false);
    }
  };

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* AI Impact Summary */}
      {volunteerId && <AIImpactSummary volunteerId={volunteerId} />}

      <div>
        <h1 className="font-display text-2xl font-bold">Recommended for You</h1>
        <p className="text-muted-foreground text-sm mt-1">Tasks matched to your skills by AI</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">AI is finding your best matches...</p>
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No recommended tasks right now. Check back soon!</p>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task, i) => (
            <Card
              key={task.id}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
              onClick={() => { setSelectedTask(task); setVisionResult(null); setSelectedPhoto(null); }}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold">{task.title}</h3>
                      {task.status === 'completed' && (
                        <Badge className="bg-success/10 text-success border-success/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {task.location}
                    </div>
                  </div>
                  {task.status !== 'completed' && (
                    <Badge className="gradient-primary text-primary-foreground border-0 shrink-0">
                      {Math.round(task.score * 100)}%
                    </Badge>
                  )}
                </div>

                {/* Trust UI — AI Explanation */}
                <div className="flex items-start gap-2 rounded-lg bg-accent/60 p-3">
                  <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-primary animate-pulse-glow" />
                  <p className="text-xs text-accent-foreground leading-relaxed">{task.reason}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {task.skills.map(s => <Badge key={s} variant={"outline" as const} className="text-xs">{s}</Badge>)}
                </div>

                {/* Task Assistant Chat */}
                <div className="pt-2 border-t">
                  <TaskAssistantChat task={{
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    location: task.location,
                    startTime: task.startTime || new Date().toISOString(),
                    requiredVolunteers: task.requiredVolunteers || 1,
                    skills: task.skills,
                    urgency: task.urgency || 'medium'
                  }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Urgent Invitations Section */}
      {invitations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <h2 className="font-display text-xl font-semibold">Срочные запросы для тебя</h2>
            <Badge variant="destructive" className="text-xs">
              {invitations.length}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            AI подобрал эти срочные задачи специально для тебя
          </p>
          
          <div className="grid gap-3">
            {invitations.map((invitation, i) => (
              <Card
                key={invitation.id}
                className="border-orange-200 bg-orange-50/50 cursor-pointer transition-all hover:shadow-md hover:border-orange-300 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
                onClick={() => setSelectedInvitation(invitation)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-sm">{invitation.task_title}</h3>
                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                          <Clock className="h-3 w-3 mr-1" />
                          Срочно
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {invitation.task_location}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-orange-600 mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(invitation.task_start_time).toLocaleString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                      {Math.round(invitation.similarity_score * 100)}%
                    </Badge>
                  </div>

                  {/* Personalized AI Invitation */}
                  <div className="flex items-start gap-2 rounded-lg bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 p-3">
                    <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-orange-600" />
                    <p className="text-xs text-orange-800 leading-relaxed">{invitation.invitation_text}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptInvitation(invitation);
                      }}
                      disabled={respondingToInvitation}
                    >
                      {respondingToInvitation ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      Принять
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectInvitation(invitation.id);
                      }}
                      disabled={respondingToInvitation}
                    >
                      <XCircle className="h-3 w-3" />
                      Отклонить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{selectedTask?.description}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {selectedTask?.location}
          </div>
          <div className="flex flex-wrap gap-1.5 my-2">
            {selectedTask?.skills.map(s => <Badge key={s} variant={"secondary" as const} className="text-xs">{s}</Badge>)}
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-accent/60 p-3 my-2">
            <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <p className="text-xs text-accent-foreground">{selectedTask?.reason}</p>
          </div>

          {/* Task Assistant Chat in Modal */}
          {selectedTask && (
            <div className="mt-4">
              <TaskAssistantChat task={{
                id: selectedTask.id,
                title: selectedTask.title,
                description: selectedTask.description,
                location: selectedTask.location,
                startTime: selectedTask.startTime || new Date().toISOString(),
                requiredVolunteers: selectedTask.requiredVolunteers || 1,
                skills: selectedTask.skills,
                urgency: selectedTask.urgency || 'medium'
              }} />
            </div>
          )}

          {selectedTask && !applied.has(selectedTask.id) && selectedTask.status !== 'completed' ? (
            <Button onClick={() => handleApply(selectedTask.id)} className="w-full gap-2">
              <Send className="h-4 w-4" />
              Apply to this Task
            </Button>
          ) : selectedTask && applied.has(selectedTask.id) && selectedTask.status !== 'completed' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-success font-medium">
                <CheckCircle2 className="h-4 w-4" />
                You have applied!
              </div>

              {/* Verification section */}
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-display text-sm font-semibold">Submit Proof of Completion</h4>
                <p className="text-xs text-muted-foreground">Upload a photo showing your completed work for AI verification.</p>
                
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={verifying}
                    className="w-full gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {selectedPhoto ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  
                  {selectedPhoto && (
                    <div className="text-xs text-muted-foreground">
                      ✓ Photo selected and ready for verification
                    </div>
                  )}
                  
                  <Button
                    onClick={() => selectedTask && handleVerify(selectedTask.id)}
                    disabled={verifying || !selectedPhoto}
                    className="w-full gap-2"
                  >
                    {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    {verifying ? 'AI is verifying...' : 'Verify Photo with AI'}
                  </Button>
                </div>

                {visionResult && (
                  <div className={`animate-slide-up rounded-lg p-3 ${visionResult.status === 'approved' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {visionResult.status === 'approved'
                        ? <CheckCircle2 className="h-4 w-4 text-success" />
                        : <XCircle className="h-4 w-4 text-destructive" />}
                      <span className={`text-sm font-semibold capitalize ${visionResult.status === 'approved' ? 'text-success' : 'text-destructive'}`}>
                        {visionResult.status}
                      </span>
                      <Badge variant={"outline" as const} className="ml-auto text-xs">
                        {Math.round(visionResult.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{visionResult.reason}</p>
                  </div>
                )}
              </div>
            </div>
          ) : selectedTask?.status === 'completed' ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-2" />
              <h4 className="font-semibold text-success">Task Completed!</h4>
              <p className="text-sm text-muted-foreground">Great work! Your completion has been verified by AI.</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
