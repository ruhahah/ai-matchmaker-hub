import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Sparkles, UserPlus, CheckCircle, MapPin, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Volunteer {
  id: string;
  name: string;
  avatar?: string;
  skills?: string[];
  bio?: string;
  location?: string;
  completedTasks?: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  skills?: string[];
  location?: string;
  urgency?: 'low' | 'medium' | 'high';
}

interface AISquadSuggestionsProps {
  task: Task;
  onInvite?: (volunteerId: string) => void;
}

export default function AISquadSuggestions({ task, onInvite }: AISquadSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<(Volunteer & { reason: string; similarityScore: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitedVolunteers, setInvitedVolunteers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    generateSuggestions();
  }, [task]);

  const generateSuggestions = async () => {
    setLoading(true);
    
    try {
      // Mock AI анализ базы волонтеров
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock база волонтеров
      const mockVolunteers: Volunteer[] = [
        {
          id: 'vol-1',
          name: 'Елена Эколог',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
          skills: ['Экология', 'Садоводство', 'Образование'],
          bio: 'Люблю природу и помогаю делать город чище',
          location: 'Алматы',
          completedTasks: 15
        },
        {
          id: 'vol-2', 
          name: 'Александр Волонтер',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander',
          skills: ['Организация', 'Логистика', 'IT'],
          bio: 'Опытный организатор мероприятий',
          location: 'Астана',
          completedTasks: 23
        },
        {
          id: 'vol-3',
          name: 'Мария Помощница',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
          skills: ['Перевод', 'Обучение', 'Работа с детьми'],
          bio: 'Всегда готова помочь нуждающимся',
          location: 'Шымкент',
          completedTasks: 8
        }
      ];

      // AI анализ сходства
      const taskSkills = (task.skills || []).map(s => s.toLowerCase());
      const taskDescription = task.description.toLowerCase();
      
      const analyzedVolunteers = mockVolunteers.map(volunteer => {
        const volunteerSkills = (volunteer.skills || []).map(s => s.toLowerCase());
        const volunteerBio = (volunteer.bio || '').toLowerCase();
        
        // Вычисляем сходство
        let similarityScore = 0;
        let reason = '';
        
        // Проверяем совпадение навыков
        const commonSkills = taskSkills.filter(skill => 
          volunteerSkills.some(vSkill => vSkill.includes(skill) || skill.includes(vSkill))
        );
        
        if (commonSkills.length > 0) {
          similarityScore += commonSkills.length * 0.3;
          reason = `✨ Похожие навыки: ${commonSkills.join(', ')}`;
        }
        
        // Проверяем совпадение интересов через био
        if (taskDescription.includes('эколог') && volunteerBio.includes('природ')) {
          similarityScore += 0.4;
          reason = reason || '🌱 Похожие интересы: Экология';
        }
        
        if (taskDescription.includes('образ') && volunteerBio.includes('образован')) {
          similarityScore += 0.4;
          reason = reason || '📚 Похожие интересы: Образование';
        }
        
        if (taskDescription.includes('организ') && volunteerBio.includes('организ')) {
          similarityScore += 0.4;
          reason = reason || '🎯 Похожие интересы: Организация';
        }
        
        // Базовое сходство по локации
        if (task.location && volunteer.location === task.location) {
          similarityScore += 0.2;
          reason = reason || `📍 Та же локация: ${task.location}`;
        }
        
        // Если нет явных совпадений, даем общую рекомендацию
        if (!reason) {
          similarityScore = Math.random() * 0.3 + 0.1; // 0.1 to 0.4
          reason = '🤝 Рекомендован на основе опыта';
        }
        
        return {
          ...volunteer,
          similarityScore: Math.min(similarityScore, 1),
          reason
        };
      });

      // Сортируем по сходству и берем топ-3
      const topSuggestions = analyzedVolunteers
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 3);

      setSuggestions(topSuggestions);
      
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (volunteerId: string, volunteerName: string) => {
    try {
      // Mock отправка приглашения
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setInvitedVolunteers(prev => new Set(prev).add(volunteerId));
      
      toast({
        title: '✅ Приглашение отправлено!',
        description: `${volunteerName} получил приглашение в команду`,
      });
      
      if (onInvite) onInvite(volunteerId);
      
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить приглашение',
        variant: 'destructive',
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600 bg-green-100';
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (suggestions.length === 0 && !loading) {
    return null;
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          AI Squad Suggestions
          <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI анализирует базу волонтеров...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((volunteer) => (
              <div key={volunteer.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {volunteer.avatar ? (
                    <img src={volunteer.avatar} alt={volunteer.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium">{volunteer.name.charAt(0)}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{volunteer.name}</h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getScoreColor(volunteer.similarityScore)}`}
                    >
                      {Math.round(volunteer.similarityScore * 100)}%
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-1">{volunteer.reason}</p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {volunteer.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {volunteer.location}
                      </span>
                    )}
                    {volunteer.completedTasks && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {volunteer.completedTasks} задач
                      </span>
                    )}
                  </div>
                  
                  {(volunteer.skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {volunteer.skills.slice(0, 2).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {(volunteer.skills || []).length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(volunteer.skills || []).length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleInvite(volunteer.id, volunteer.name)}
                  disabled={invitedVolunteers.has(volunteer.id)}
                  className="shrink-0"
                >
                  {invitedVolunteers.has(volunteer.id) ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Приглашен
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3 mr-1" />
                      Позвать
                    </>
                  )}
                </Button>
              </div>
            ))}
            
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" onClick={generateSuggestions}>
                <Sparkles className="w-3 h-3 mr-1" />
                Обновить рекомендации
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
