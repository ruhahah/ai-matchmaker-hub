import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Award, 
  TrendingUp, 
  Star, 
  Plus, 
  Edit,
  CheckCircle,
  XCircle,
  BookOpen,
  Target,
  Zap
} from 'lucide-react';
import { SkillsMatchingService, UserSkill } from '@/lib/skillsMatching';

interface UserSkillsManagerProps {
  userId: string;
  onSkillsUpdated?: () => void;
}

export default function UserSkillsManager({ userId, onSkillsUpdated }: UserSkillsManagerProps) {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'social' as const,
    level: 1
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const userSkills = SkillsMatchingService.getUserSkills(userId);
    setSkills(userSkills);
  }, [userId]);

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название навыка',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      const addedSkill = SkillsMatchingService.addUserSkill(userId, {
        name: newSkill.name.trim(),
        category: newSkill.category,
        level: newSkill.level,
        verified: false // Новые навыки требуют подтверждения
      });

      setSkills(prev => [...prev, addedSkill]);
      
      toast({
        title: 'Навык добавлен!',
        description: `Навык "${addedSkill.name}" добавлен в ваш профиль`,
      });

      setNewSkill({ name: '', category: 'social', level: 1 });
      setIsAddDialogOpen(false);
      
      if (onSkillsUpdated) {
        onSkillsUpdated();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить навык',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateSkillLevel = (skillId: string, newLevel: number) => {
    SkillsMatchingService.updateSkillLevel(userId, skillId, newLevel);
    setSkills(prev => 
      prev.map(skill => 
        skill.id === skillId ? { ...skill, level: newLevel } : skill
      )
    );
    
    toast({
      title: 'Уровень обновлен!',
      description: `Уровень навыка обновлен до ${SkillsMatchingService.getSkillLevelName(newLevel)}`,
    });
  };

  const getSkillCategoryName = (category: string) => {
    const categories = {
      technical: 'Технические',
      social: 'Социальные',
      creative: 'Творческие',
      sports: 'Спортивные',
      professional: 'Профессиональные',
      educational: 'Образовательные'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getSkillCategoryColor = (category: string) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      social: 'bg-green-100 text-green-800',
      creative: 'bg-purple-100 text-purple-800',
      sports: 'bg-orange-100 text-orange-800',
      professional: 'bg-red-100 text-red-800',
      educational: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level: number) => {
    if (level >= 5) return 'bg-purple-500';
    if (level >= 4) return 'bg-blue-500';
    if (level >= 3) return 'bg-green-500';
    if (level >= 2) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const stats = SkillsMatchingService.getUserSkillStats(userId);

  return (
    <div className="space-y-6">
      {/* Статистика навыков */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Статистика навыков
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSkills}</div>
              <div className="text-sm text-gray-600">Всего навыков</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.verifiedSkills}</div>
              <div className="text-sm text-gray-600">Подтверждено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.averageLevel}</div>
              <div className="text-sm text-gray-600">Средний уровень</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalExperience}</div>
              <div className="text-sm text-gray-600">Опыт</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Топ навыки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Топ навыки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topSkills.map((skill, index) => {
              const progress = SkillsMatchingService.getSkillProgress(skill);
              return (
                <div key={skill.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" 
                         style={{ backgroundColor: getLevelColor(skill.level) }}>
                      {skill.level}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{skill.name}</h4>
                        <Badge className={getSkillCategoryColor(skill.category)}>
                          {getSkillCategoryName(skill.category)}
                        </Badge>
                        {skill.verified && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Опыт: {skill.experience} задач
                      </div>
                      <Progress value={progress.progress} className="h-2" />
                      <div className="text-xs text-gray-500 mt-1">
                        {progress.experienceToNext > 0 ? 
                          `${progress.experienceToNext} опыта до уровня ${SkillsMatchingService.getSkillLevelName(progress.nextLevel)}` :
                          'Максимальный уровень'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-400">
                    #{index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Все навыки */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-600" />
            Мои навыки
          </CardTitle>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Добавить навык
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить новый навык</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Название навыка</label>
                  <Input
                    placeholder="Например: Программирование"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Категория</label>
                  <Select 
                    value={newSkill.category} 
                    onValueChange={(value) => setNewSkill(prev => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Технические</SelectItem>
                      <SelectItem value="social">Социальные</SelectItem>
                      <SelectItem value="creative">Творческие</SelectItem>
                      <SelectItem value="sports">Спортивные</SelectItem>
                      <SelectItem value="professional">Профессиональные</SelectItem>
                      <SelectItem value="educational">Образовательные</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Начальный уровень</label>
                  <Select 
                    value={newSkill.level.toString()} 
                    onValueChange={(value) => setNewSkill(prev => ({ ...prev, level: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Начинающий</SelectItem>
                      <SelectItem value="2">2 - Любитель</SelectItem>
                      <SelectItem value="3">3 - Продвинутый</SelectItem>
                      <SelectItem value="4">4 - Эксперт</SelectItem>
                      <SelectItem value="5">5 - Мастер</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleAddSkill} disabled={isAdding}>
                    {isAdding ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Добавление...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          {skills.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">У вас пока нет навыков</h3>
              <p className="text-sm text-gray-500 mb-4">
                Добавьте навыки, чтобы получать более релевантные задачи
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить первый навык
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map(skill => {
                const progress = SkillsMatchingService.getSkillProgress(skill);
                return (
                  <Card key={skill.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" 
                               style={{ backgroundColor: getLevelColor(skill.level) }}>
                            {skill.level}
                          </div>
                          <div>
                            <h4 className="font-medium">{skill.name}</h4>
                            <Badge className={`mt-1 ${getSkillCategoryColor(skill.category)}`}>
                              {getSkillCategoryName(skill.category)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          {skill.verified ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateSkillLevel(skill.id, Math.min(skill.level + 1, 5))}
                            disabled={skill.level >= 5}
                          >
                            <TrendingUp className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Опыт:</span>
                          <span className="font-medium">{skill.experience} задач</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Уровень:</span>
                          <span className="font-medium">
                            {SkillsMatchingService.getSkillLevelName(skill.level)}
                          </span>
                        </div>
                        
                        {progress.experienceToNext > 0 && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Прогресс:</span>
                              <span className="font-medium">{progress.progress}%</span>
                            </div>
                            <Progress value={progress.progress} className="h-2" />
                            <div className="text-xs text-gray-500 mt-1">
                              {progress.experienceToNext} опыта до уровня {SkillsMatchingService.getSkillLevelName(progress.nextLevel)}
                            </div>
                          </div>
                        )}
                        
                        {skill.level >= 5 && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <Zap className="w-4 h-4" />
                            <span className="font-medium">Максимальный уровень!</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
