import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, TrendingUp, Target, Zap, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImpactData {
  archetype: string;
  archetype_emoji: string;
  impact_summary: string;
  forecast: string;
  streak_text: string;
  completed_tasks_count: number;
  volunteer_name: string;
}

interface AIImpactSummaryProps {
  volunteerId: string;
}

export default function AIImpactSummary({ volunteerId }: AIImpactSummaryProps) {
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchImpact = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock implementation - генерируем данные локально
      const mockData: ImpactData = {
        archetype: 'Эко-Активист',
        archetype_emoji: '🌱',
        impact_summary: 'Благодаря тебе было посажено 50 деревьев и очищено 3 парка',
        forecast: 'Твои навыки в организации экомероприятий могут помочь в создании зеленых зон города',
        streak_text: '5 задач подряд!',
        completed_tasks_count: 5,
        volunteer_name: 'Алексей Волонтер'
      };

      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setData(mockData);
    } catch (err: any) {
      console.error('Impact summary error:', err);
      setError(err.message || 'Не удалось загрузить AI Impact Summary');
      toast({
        title: 'Ошибка',
        description: err.message || 'Не удалось загрузить AI Impact Summary',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (volunteerId) fetchImpact();
  }, [volunteerId]);

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 bg-primary/20 rounded-full animate-ping" />
            </div>
            <p className="text-sm text-muted-foreground">AI анализирует твой вклад...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">{error || 'Нет данных'}</p>
          <Button variant="outline" size="sm" onClick={fetchImpact} className="gap-2">
            <RefreshCw className="h-3 w-3" />
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">AI Impact Summary</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchImpact}
          className="gap-1.5 text-muted-foreground hover:text-primary"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Обновить
        </Button>
      </div>

      {/* Archetype Hero Card */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 shadow-lg shadow-primary/5">
        <CardContent className="p-0">
          <div className="relative p-6 pb-4">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

            <div className="relative flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-3xl shadow-md shadow-primary/20">
                {data.archetype_emoji}
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Твой архетип</p>
                <h3 className="font-display text-2xl font-bold text-foreground mt-0.5 truncate">
                  {data.archetype}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {data.completed_tasks_count} {data.completed_tasks_count === 1 ? 'задача' : data.completed_tasks_count < 5 ? 'задачи' : 'задач'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{data.streak_text}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Impact & Forecast sections */}
          <div className="grid gap-0 divide-y divide-border/50">
            {/* Impact */}
            <div className="px-6 py-4 flex items-start gap-3 bg-background/40">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-success/10 shrink-0 mt-0.5">
                <TrendingUp className="h-4.5 w-4.5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-success mb-1">Твой вклад</p>
                <p className="text-sm text-foreground leading-relaxed">{data.impact_summary}</p>
              </div>
            </div>

            {/* Forecast */}
            <div className="px-6 py-4 flex items-start gap-3 bg-background/40">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary/10 shrink-0 mt-0.5">
                <Target className="h-4.5 w-4.5 text-secondary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary mb-1">Прогноз AI</p>
                <p className="text-sm text-foreground leading-relaxed">{data.forecast}</p>
              </div>
            </div>
          </div>

          {/* Powered by badge */}
          <div className="px-6 py-3 bg-muted/30 flex items-center justify-center gap-1.5">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              Powered by AI
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
