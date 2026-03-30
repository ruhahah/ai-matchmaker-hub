import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Sparkles, Send, MapPin, Users, CheckCircle2, Clock, Eye } from 'lucide-react';
import { getTasks, getProfiles, aiIntakeText, aiSemanticMatching, type Task, type Profile, type MatchingResult, type IntakeResult } from '@/lib/mockApi';

export default function OrganizerDashboard() {
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [draft, setDraft] = useState<IntakeResult | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [matches, setMatches] = useState<(MatchingResult & { profile?: Profile })[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    Promise.all([getTasks('organizer'), getProfiles('volunteer')]).then(([t, p]) => {
      setTasks(t);
      setProfiles(p);
      setLoading(false);
    });
  }, []);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setParsing(true);
    setPublished(false);
    const result = await aiIntakeText(rawText);
    setDraft(result);
    setParsing(false);
  };

  const handlePublish = () => {
    if (!draft) return;
    const newTask: Task = {
      id: `t${Date.now()}`,
      title: draft.title,
      description: draft.description,
      skills: draft.skills,
      location: 'To be determined',
      status: 'open',
      creatorId: 'org1',
    };
    setTasks(prev => [newTask, ...prev]);
    setDraft(null);
    setRawText('');
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
  };

  const openMatching = async (task: Task) => {
    setSelectedTask(task);
    setMatchLoading(true);
    const profileIds = profiles.map(p => p.id);
    const results = await aiSemanticMatching(task.id, profileIds);
    setMatches(results.map(r => ({ ...r, profile: profiles.find(p => p.id === r.volunteerId) })));
    setMatchLoading(false);
  };

  const statusIcon = (s: Task['status']) => {
    if (s === 'completed') return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (s === 'verifying') return <Clock className="h-4 w-4 text-warning" />;
    return <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />;
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* AI Intake */}
      <Card className="ai-glow border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Task with AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe what you need in plain language, e.g. 'We need someone to paint the fence on Saturday'..."
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <Button onClick={handleParse} disabled={parsing || !rawText.trim()} className="gap-2">
            {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {parsing ? 'AI is parsing...' : 'Parse with AI'}
          </Button>

          {draft && (
            <div className="animate-slide-up space-y-4 rounded-lg border bg-accent/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI-Generated Draft</p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Skills</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {draft.skills.map(s => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Urgency</label>
                  <Badge variant={draft.urgency === 'high' ? 'destructive' : 'outline'} className="ml-2 capitalize">
                    {draft.urgency}
                  </Badge>
                </div>
              </div>
              <Button onClick={handlePublish} className="gap-2 gradient-secondary text-secondary-foreground border-0">
                <Send className="h-4 w-4" />
                Publish Task
              </Button>
            </div>
          )}

          {published && (
            <div className="animate-slide-up flex items-center gap-2 text-sm text-success font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Task published successfully!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">My Tasks</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No tasks yet. Create your first task above!</p>
        ) : (
          <div className="grid gap-3">
            {tasks.map(task => (
              <Card key={task.id} className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30" onClick={() => openMatching(task)}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {statusIcon(task.status)}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {task.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs capitalize">{task.status}</Badge>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Matching Modal */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{selectedTask?.description}</p>
          <div className="flex flex-wrap gap-1.5 my-2">
            {selectedTask?.skills.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
          </div>

          <h3 className="font-display font-semibold mt-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-Matched Volunteers
          </h3>

          {matchLoading ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Finding best matches...</p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {matches.map(m => (
                <Card key={m.volunteerId} className="border-primary/10">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {m.profile?.name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium">{m.profile?.name || m.volunteerId}</span>
                      </div>
                      <Badge className="gradient-primary text-primary-foreground border-0">
                        {Math.round(m.score * 100)}% match
                      </Badge>
                    </div>
                    <div className="flex items-start gap-2 rounded-md bg-accent/50 p-2.5">
                      <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                      <p className="text-xs text-accent-foreground">{m.reason}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {m.profile?.skills.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
