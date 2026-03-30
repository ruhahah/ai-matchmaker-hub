import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Sparkles, MapPin, CheckCircle2, XCircle, Camera, Send } from 'lucide-react';
import { getTasks, getProfiles, aiSemanticMatching, aiVisionVerify, type Task, type MatchingResult, type VisionResult } from '@/lib/mockApi';

interface RecommendedTask extends Task {
  score: number;
  reason: string;
}

export default function VolunteerDashboard() {
  const [tasks, setTasks] = useState<RecommendedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<RecommendedTask | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [verifying, setVerifying] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);

  useEffect(() => {
    (async () => {
      const [allTasks, profiles] = await Promise.all([getTasks('volunteer'), getProfiles('volunteer')]);
      const myProfile = profiles[0]; // mock: first profile is "me"
      const openTasks = allTasks.filter(t => t.status === 'open' || t.status === 'verifying');
      const matching = await aiSemanticMatching('all', [myProfile.id]);

      const recommended: RecommendedTask[] = openTasks.map(t => {
        const match = matching.find(m => m.taskId === 'all') || { score: 0.85 + Math.random() * 0.14, reason: `Recommended because your bio mentions experience relevant to ${t.skills[0]}` };
        return { ...t, score: parseFloat(match.score.toFixed(2)), reason: match.reason };
      }).filter(t => t.score > 0.8).sort((a, b) => b.score - a.score);

      setTasks(recommended);
      setLoading(false);
    })();
  }, []);

  const handleApply = (taskId: string) => {
    setApplied(prev => new Set(prev).add(taskId));
  };

  const handleVerify = async (taskId: string) => {
    setVerifying(true);
    setVisionResult(null);
    const result = await aiVisionVerify(taskId, 'fake-base64-photo-data');
    setVisionResult(result);
    setVerifying(false);
  };

  return (
    <div className="container max-w-3xl py-8 space-y-6">
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
              onClick={() => { setSelectedTask(task); setVisionResult(null); }}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold">{task.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {task.location}
                    </div>
                  </div>
                  <Badge className="gradient-primary text-primary-foreground border-0 shrink-0">
                    {Math.round(task.score * 100)}%
                  </Badge>
                </div>

                {/* Trust UI — AI Explanation */}
                <div className="flex items-start gap-2 rounded-lg bg-accent/60 p-3">
                  <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-primary animate-pulse-glow" />
                  <p className="text-xs text-accent-foreground leading-relaxed">{task.reason}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {task.skills.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                </div>
              </CardContent>
            </Card>
          ))}
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
            {selectedTask?.skills.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-accent/60 p-3 my-2">
            <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <p className="text-xs text-accent-foreground">{selectedTask?.reason}</p>
          </div>

          {selectedTask && !applied.has(selectedTask.id) ? (
            <Button onClick={() => handleApply(selectedTask.id)} className="w-full gap-2">
              <Send className="h-4 w-4" />
              Apply to this Task
            </Button>
          ) : selectedTask && applied.has(selectedTask.id) ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-success font-medium">
                <CheckCircle2 className="h-4 w-4" />
                You have applied!
              </div>

              {/* Verification section */}
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-display text-sm font-semibold">Submit Proof of Completion</h4>
                <p className="text-xs text-muted-foreground">Upload a photo showing your completed work for AI verification.</p>
                <Button
                  variant="outline"
                  onClick={() => handleVerify(selectedTask.id)}
                  disabled={verifying}
                  className="w-full gap-2"
                >
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  {verifying ? 'AI is verifying...' : 'Simulate Photo Upload'}
                </Button>

                {visionResult && (
                  <div className={`animate-slide-up rounded-lg p-3 ${visionResult.status === 'approved' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {visionResult.status === 'approved'
                        ? <CheckCircle2 className="h-4 w-4 text-success" />
                        : <XCircle className="h-4 w-4 text-destructive" />}
                      <span className={`text-sm font-semibold capitalize ${visionResult.status === 'approved' ? 'text-success' : 'text-destructive'}`}>
                        {visionResult.status}
                      </span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {Math.round(visionResult.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{visionResult.reason}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
