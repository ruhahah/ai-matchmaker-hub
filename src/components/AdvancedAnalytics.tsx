import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Clock, 
  MapPin, 
  Star, 
  Zap, 
  Brain,
  Award,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  totalVolunteers: number;
  activeVolunteers: number;
  avgCompletionTime: number;
  topSkills: Array<{ skill: string; count: number; trend: 'up' | 'down' }>;
  locationStats: Array<{ city: string; tasks: number; volunteers: number }>;
  monthlyTrend: Array<{ month: string; tasks: number; completions: number }>;
  aiInsights: string[];
  impactMetrics: {
    treesPlanted: number;
    peopleHelped: number;
    hoursContributed: number;
    communityScore: number;
  };
}

export default function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    generateAnalyticsData();
  }, [selectedPeriod]);

  const generateAnalyticsData = async () => {
    setLoading(true);
    
    // Mock генерация аналитических данных
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockData: AnalyticsData = {
      totalTasks: 47,
      completedTasks: 32,
      totalVolunteers: 128,
      activeVolunteers: 89,
      avgCompletionTime: 4.2, // days
      topSkills: [
        { skill: 'Экология', count: 23, trend: 'up' as const },
        { skill: 'Образование', count: 18, trend: 'up' as const },
        { skill: 'IT поддержка', count: 15, trend: 'down' as const },
        { skill: 'Организация', count: 12, trend: 'up' as const },
        { skill: 'Перевод', count: 10, trend: 'up' as const }
      ],
      locationStats: [
        { city: 'Алматы', tasks: 18, volunteers: 45 },
        { city: 'Астана', tasks: 12, volunteers: 32 },
        { city: 'Шымкент', tasks: 9, volunteers: 28 },
        { city: 'Караганда', tasks: 5, volunteers: 15 },
        { city: 'Актобе', tasks: 3, volunteers: 8 }
      ],
      monthlyTrend: [
        { month: 'Янв', tasks: 8, completions: 6 },
        { month: 'Фев', tasks: 12, completions: 9 },
        { month: 'Мар', tasks: 15, completions: 11 },
        { month: 'Апр', tasks: 12, completions: 6 }
      ],
      aiInsights: [
        '🌱 Экологические задачи показывают 40% рост вовлеченности волонтеров',
        '📚 Образовательные проекты имеют самый высокий показатель завершения (87%)',
        '🤝 Командные задачи завершаются на 25% быстрее индивидуальных',
        '🎯 Целевые приглашения увеличивают конверсию на 3.5x'
      ],
      impactMetrics: {
        treesPlanted: 234,
        peopleHelped: 1567,
        hoursContributed: 892,
        communityScore: 8.7
      }
    };
    
    setData(mockData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const completionRate = Math.round((data.completedTasks / data.totalTasks) * 100);
  const volunteerActivityRate = Math.round((data.activeVolunteers / data.totalVolunteers) * 100);

  return (
    <div className="space-y-6">
      {/* AI Insights Banner */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Аналитика и инсайты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.aiInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2 bg-white/10 rounded-lg p-3">
                <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Всего задач
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-green-600">{data.totalTasks}</div>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                <ArrowUpRight className="w-3 h-3" />
                +12%
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-1">За последний месяц</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Волонтеры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-blue-600">{data.totalVolunteers}</div>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                <ArrowUpRight className="w-3 h-3" />
                +8%
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-1">{data.activeVolunteers} активных</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Выполнение
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-purple-600">{completionRate}%</div>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                <ArrowUpRight className="w-3 h-3" />
                +5%
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-1">{data.completedTasks} из {data.totalTasks}</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Срок выполнения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-orange-600">{data.avgCompletionTime}</div>
              <span className="text-sm text-gray-600">дней</span>
            </div>
            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-green-500" />
              -0.8 дня
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Популярные навыки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topSkills.map((skill, index) => (
                <div key={skill.skill} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{skill.count} задач</span>
                      {skill.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-green-500" />}
                      {skill.trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                    </div>
                  </div>
                  <Progress value={(skill.count / data.totalTasks) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              География задач
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.locationStats.map((location) => (
                <div key={location.city} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{location.city}</div>
                    <div className="text-sm text-gray-600">{location.volunteers} волонтеров</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{location.tasks}</div>
                    <div className="text-xs text-gray-600">задач</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Динамика по месяцам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.monthlyTrend.map((month) => (
              <div key={month.month} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{month.month}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-blue-600">{month.tasks} создано</span>
                    <span className="text-green-600">{month.completions} выполнено</span>
                    <span className="text-gray-600">
                      {Math.round((month.completions / month.tasks) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Progress value={(month.tasks / 20) * 100} className="flex-1 h-2" />
                  <Progress value={(month.completions / 20) * 100} className="flex-1 h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Metrics */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Социальный вклад
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{data.impactMetrics.treesPlanted}</div>
              <p className="text-sm text-gray-600">Деревьев посажено</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{data.impactMetrics.peopleHelped}</div>
              <p className="text-sm text-gray-600">Людям помогли</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{data.impactMetrics.hoursContributed}</div>
              <p className="text-sm text-gray-600">Часов внесено</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{data.impactMetrics.communityScore}</div>
              <p className="text-sm text-gray-600">Рейтинг сообщества</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button onClick={generateAnalyticsData} size="sm">
          <Activity className="w-4 h-4 mr-2" />
          Обновить данные
        </Button>
      </div>
    </div>
  );
}
