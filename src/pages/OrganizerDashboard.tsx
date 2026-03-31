import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
<<<<<<< HEAD
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, MapPin, Users, CheckCircle2, Clock, Eye, Bot } from 'lucide-react';
import { getTasks, getProfiles, aiSemanticMatching, type Task, type Profile, type MatchingResult } from '@/lib/mockApi';
=======
import { Loader2, Sparkles, Send, MapPin, Users, CheckCircle2, Clock, Eye, Mic, MicOff, AudioLines } from 'lucide-react';
import { getTasks, getProfiles, aiIntakeText, aiSemanticMatching, createTaskWithAI, type Task, type Profile, type MatchingResult, type IntakeResult } from '@/lib/mockApi';
>>>>>>> 444c9e1056cebab152ca0d1c565bfc359c98c693
import { useToast } from '@/hooks/use-toast';
import AiTaskCreator from '@/components/AiTaskCreator';

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [matches, setMatches] = useState<(MatchingResult & { profile?: Profile })[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
<<<<<<< HEAD
=======
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const autoParseRef = useRef(false);

  const { toast } = useToast();
>>>>>>> 444c9e1056cebab152ca0d1c565bfc359c98c693

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

<<<<<<< HEAD
  const handleViewMatches = async (task: Task) => {
=======
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
>>>>>>> 444c9e1056cebab152ca0d1c565bfc359c98c693
    setSelectedTask(task);
    setMatchLoading(true);
    try {
      const matches = await aiSemanticMatching(task.id);
      const matchesWithProfiles = matches.map(match => ({
        ...match,
        profile: profiles.find(p => p.id === match.volunteerId)
      }));
      setMatches(matchesWithProfiles);
    } catch (err: any) {
      toast({
        title: 'Failed to load matches',
        description: err.message || 'Could not load volunteer matches.',
        variant: 'destructive',
      });
    } finally {
      setMatchLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'verifying': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

<<<<<<< HEAD
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Открыта';
      case 'verifying': return 'Проверка';
      case 'completed': return 'Завершена';
      case 'cancelled': return 'Отменена';
      default: return status;
    }
  };
=======
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
>>>>>>> 444c9e1056cebab152ca0d1c565bfc359c98c693

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Срочно';
      case 'medium': return 'Средняя';
      case 'low': return 'Низкая';
      default: return urgency;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏛️ Кабинет организатора
          </h1>
          <p className="text-gray-600">
            Управляйте социальными задачами и находите идеальных волонтеров с помощью AI
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Создать задачу
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Активные задачи ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Аналитика
            </TabsTrigger>
          </TabsList>

<<<<<<< HEAD
          <TabsContent value="create">
            <AiTaskCreator />
          </TabsContent>

          <TabsContent value="tasks">
            <div className="grid gap-6">
              {tasks.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Пока нет задач
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Создайте свою первую задачу с помощью AI-координатора
                    </p>
                    <Button onClick={() => window.location.reload()}>
                      Перейти к созданию
                    </Button>
=======
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
>>>>>>> 444c9e1056cebab152ca0d1c565bfc359c98c693
                  </CardContent>
                </Card>
              ) : (
                tasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{task.title}</CardTitle>
                          <p className="text-gray-600 mb-4">{task.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className={getStatusColor(task.status)}>
                              {getStatusLabel(task.status)}
                            </Badge>
                            <Badge className={getUrgencyColor(task.urgency)}>
                              {getUrgencyLabel(task.urgency)}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {task.location}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {task.requiredVolunteers} волонтеров
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(task.startTime).toLocaleDateString('ru-RU')}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {task.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewMatches(task)}
                            disabled={matchLoading}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Мэтчи
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Всего задач</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{tasks.length}</div>
                  <p className="text-sm text-gray-600 mt-1">Активных проектов</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">👥 Волонтеры</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{profiles.length}</div>
                  <p className="text-sm text-gray-600 mt-1">В базе данных</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🤖 AI-мэтчинг</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">100%</div>
                  <p className="text-sm text-gray-600 mt-1">Автоматизация</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">📈 Статистика по задачам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-600">
                          {task.applications?.length || 0} откликов
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(task.startTime).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Task Matches Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI-рекомендации для "{selectedTask?.title}"
              </DialogTitle>
            </DialogHeader>
            
            {matchLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">AI ищет идеальных кандидатов...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🤷‍♂️</div>
                    <p className="text-gray-600">Подходящих волонтеров пока не найдено</p>
                  </div>
                ) : (
                  matches.map((match, index) => (
                    <Card key={match.volunteerId} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{match.profile?.name}</h4>
                              <Badge className="bg-blue-100 text-blue-800">
                                {Math.round(match.score * 100)}% совпадение
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-3">{match.profile?.bio}</p>
                            
                            {match.reason && (
                              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Sparkles className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">Почему рекомендуем:</span>
                                </div>
                                <p className="text-blue-800 text-sm">{match.reason}</p>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-1">
                              {match.profile?.skills.map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <Button className="ml-4">
                            <Users className="w-4 h-4 mr-1" />
                            Пригласить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
