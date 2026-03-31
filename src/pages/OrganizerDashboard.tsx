import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Sparkles, Send, MapPin, Users, CheckCircle2, Clock, Eye, Mic, MicOff, AudioLines } from 'lucide-react';
import { getTasks, getProfiles, aiIntakeText, aiSemanticMatching, createTaskWithAI, type Task, type Profile, type MatchingResult, type IntakeResult } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';

// Extend window for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

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
  const [publishing, setPublishing] = useState(false);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const autoParseRef = useRef(false);

  const { toast } = useToast();

  useEffect(() => {
    Promise.all([getTasks('organizer'), getProfiles('volunteer')]).then(([t, p]) => {
      setTasks(t);
      setProfiles(p);
      setLoading(false);
    });
  }, []);

  // Auto-parse after voice input completes
  const triggerAutoParse = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setParsing(true);
    setPublished(false);
    try {
      const result = await aiIntakeText(text);
      setDraft(result);
      toast({
        title: '🎤 Голос → Задача',
        description: 'AI успешно обработал голосовой ввод!',
      });
    } catch (err: any) {
      toast({
        title: 'AI Processing Failed',
        description: err.message || 'Could not parse the text. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setParsing(false);
    }
  }, [toast]);

  const startRecording = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      toast({
        title: 'Не поддерживается',
        description: 'Ваш браузер не поддерживает распознавание речи. Используйте Chrome или Edge.',
        variant: 'destructive',
      });
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ru-RU';

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsRecording(true);
      setInterimText('');
      autoParseRef.current = true;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      const combined = (finalTranscript + interim).trim();
      setRawText(combined);
      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast({
          title: 'Ошибка записи',
          description: `Ошибка распознавания речи: ${event.error}`,
          variant: 'destructive',
        });
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimText('');

      // Auto-trigger AI parse when recording ends
      const text = finalTranscript.trim();
      if (text && autoParseRef.current) {
        autoParseRef.current = false;
        setIsTranscribing(true);
        setTimeout(() => {
          setIsTranscribing(false);
          triggerAutoParse(text);
        }, 300);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [toast, triggerAutoParse]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setParsing(true);
    setPublished(false);
    try {
      const result = await aiIntakeText(rawText);
      setDraft(result);
    } catch (err: any) {
      toast({
        title: 'AI Processing Failed',
        description: err.message || 'Could not parse the text. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setParsing(false);
    }
  };

  const handlePublish = async () => {
    if (!draft) return;
    setPublishing(true);
    try {
      const result = await createTaskWithAI({
        title: draft.title,
        description: draft.description,
        skills: draft.skills,
        location: 'To be determined',
        urgency: draft.urgency,
        creatorId: 'org1',
      });

      setTasks(prev => [result.task, ...prev]);
      setDraft(null);
      setRawText('');
      setPublished(true);

      if (result.matches.length > 0) {
        setMatches(result.matches.map(r => ({
          ...r,
          profile: r.volunteerName ? {
            id: r.volunteerId,
            name: r.volunteerName,
            avatar: '',
            skills: r.volunteerSkills || [],
            bio: r.volunteerBio || '',
            role: 'volunteer' as const,
          } : profiles.find(p => p.id === r.volunteerId),
        })));
        setSelectedTask(result.task);
      }

      setTimeout(() => setPublished(false), 3000);
    } catch (err: any) {
      toast({
        title: 'Publishing Failed',
        description: err.message || 'Could not create task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPublishing(false);
    }
  };

  const openMatching = async (task: Task) => {
    setSelectedTask(task);
    setMatchLoading(true);
    try {
      const results = await aiSemanticMatching(task.id, []);
      setMatches(results.map(r => ({
        ...r,
        profile: r.volunteerName ? {
          id: r.volunteerId,
          name: r.volunteerName,
          avatar: '',
          skills: r.volunteerSkills || [],
          bio: r.volunteerBio || '',
          role: 'volunteer' as const,
        } : profiles.find(p => p.id === r.volunteerId),
      })));
    } catch (err: any) {
      toast({
        title: 'Matching Failed',
        description: err.message || 'Could not find matches.',
        variant: 'destructive',
      });
    } finally {
      setMatchLoading(false);
    }
  };

  const statusIcon = (s: Task['status']) => {
    if (s === 'completed') return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (s === 'verifying') return <Clock className="h-4 w-4 text-warning" />;
    return <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />;
  };

  const isVoiceProcessing = isRecording || isTranscribing || (parsing && autoParseRef.current);

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
          {/* Voice recording indicator */}
          {isRecording && (
            <div className="animate-slide-up flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
              <div className="relative flex items-center justify-center">
                <AudioLines className="h-5 w-5 text-destructive animate-pulse" />
                <div className="absolute inset-0 h-5 w-5 bg-destructive/20 rounded-full animate-ping" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive">Запись...</p>
                <p className="text-xs text-muted-foreground truncate">
                  {interimText ? `«${interimText}»` : 'Говорите, AI слушает'}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={stopRecording}
                className="gap-1.5 shrink-0"
              >
                <MicOff className="h-3.5 w-3.5" />
                Стоп
              </Button>
            </div>
          )}

          {isTranscribing && (
            <div className="animate-slide-up flex items-center gap-3 rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              <p className="text-sm text-primary font-medium">Обрабатываю запись...</p>
            </div>
          )}

          <div className="relative">
            <Textarea
              placeholder="Опишите задачу голосом 🎤 или текстом, например: 'Нам нужен кто-то покрасить забор в субботу'..."
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              className="min-h-[100px] resize-none pr-14"
            />
            {/* Floating mic button */}
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={toggleRecording}
              disabled={parsing || isTranscribing}
              className={`absolute right-2 bottom-2 h-10 w-10 rounded-full shadow-md transition-all ${
                isRecording
                  ? 'animate-pulse bg-destructive hover:bg-destructive/90'
                  : 'hover:bg-primary hover:text-primary-foreground hover:border-primary'
              }`}
              title={isRecording ? 'Остановить запись' : 'Начать голосовой ввод'}
            >
              {isRecording ? (
                <MicOff className="h-4.5 w-4.5" />
              ) : (
                <Mic className="h-4.5 w-4.5" />
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleParse} disabled={parsing || !rawText.trim() || isRecording} className="gap-2">
              {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {parsing ? 'AI is parsing...' : 'Parse with AI'}
            </Button>

            {!isRecording && (
              <Button
                variant="outline"
                onClick={startRecording}
                disabled={parsing || isTranscribing}
                className="gap-2"
              >
                <Mic className="h-4 w-4" />
                Голосовой ввод
              </Button>
            )}
          </div>

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
              <Button onClick={handlePublish} disabled={publishing} className="gap-2 gradient-secondary text-secondary-foreground border-0">
                {publishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Publish Task
                  </>
                )}
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
                    <div className="flex items-start gap-2 rounded-md bg-gradient-to-r from-primary/5 to-accent/30 border border-primary/10 p-2.5">
                      <span className="text-lg">✨</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-primary mb-1">AI Insight</p>
                        <p className="text-xs text-muted-foreground">{m.ai_reason || m.reason}</p>
                      </div>
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
