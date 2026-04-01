import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MapPin, Clock, TrendingUp, Zap, CheckCircle, Star, Heart, Target } from 'lucide-react';
import { getDemoVolunteerProfile, updateDemoVolunteerProfile, type DemoVolunteerProfile } from '@/lib/demoProfile';
import { aiTaskRecommendations, getProfiles, type TaskRecommendation } from '@/lib/mockApi';
import AiMatchReason from '@/components/AiMatchReason';
import { useToast } from '@/hooks/use-toast';

interface DiscoveryFeedProps {
  tasks: TaskRecommendation[];
  loading: boolean;
}

function DiscoveryFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DiscoveryFeed({ tasks, loading }: DiscoveryFeedProps) {
  const { toast } = useToast();
  const [demoProfile, setDemoProfile] = useState<DemoVolunteerProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getDemoVolunteerProfile('vol-1');
      setDemoProfile(profile);
    };

    loadProfile();
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleAcceptTask = async (taskId: string) => {
    try {
      // Simulate task acceptance
      await updateDemoVolunteerProfile('vol-1', {});
      
      toast({
        title: '✅ Задача принята!',
        description: 'Вы откликнулись на задачу. Рейтинг обновлен.',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось принять задачу',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  if (loading) {
    return <DiscoveryFeedSkeleton />;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          AI анализирует ваш профиль...
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Ищем идеальные задачи на основе ваших навыков и предпочтений.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎯 Рекомендации для вас
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          AI подобрал задачи, которые идеально соответствуют вашему профилю
        </p>
      </div>

      {/* Demo Profile Card */}
      {demoProfile && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-blue-300">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900">
                  {demoProfile.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    Рейтинг: {(demoProfile.completedTasks / 5).toFixed(1)}/5.0
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {demoProfile.bio}
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {demoProfile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Выполнено задач: {demoProfile.completedTasks}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span>Присоединился: {new Date(demoProfile.joinedAt || '').toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task, index) => (
          <Card 
            key={task.taskId} 
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              {/* Urgent Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {task.title}
                  </h3>
                  {task.score >= 0.9 && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 animate-pulse">
                      <Zap className="w-3 h-3 mr-1" />
                      Срочно
                    </Badge>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAcceptTask(task.taskId)}
                  className="shrink-0"
                >
                  Принять задачу
                </Button>
              </div>

              {/* Location and Time */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{task.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </div>
              </div>

              {/* AI Match Reason */}
              <AiMatchReason
                score={task.score}
                reason={task.reason}
                volunteerName={demoProfile?.name}
                taskTitle={task.title}
                compact={true}
              />

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mt-4">
                {task.skills.map((skill, skillIndex) => (
                  <Badge key={skillIndex} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>

              {/* Trust UI - AI Insight */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">
                      ✨ AI рекомендует:
                    </h4>
                    <p className="text-blue-800 text-xs leading-relaxed">
                      {task.reason}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center mt-8">
        <Button 
          onClick={handleRefresh}
          className="gap-2"
          variant="outline"
        >
          <TrendingUp className="w-4 h-4" />
          Обновить рекомендации
        </Button>
      </div>
    </div>
  );
}
