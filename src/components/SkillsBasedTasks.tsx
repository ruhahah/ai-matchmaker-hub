import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  TrendingUp, 
  Star, 
  BookOpen,
  Search,
  Filter,
  Clock,
  MapPin,
  Users,
  Zap,
  Bot
} from 'lucide-react';
import { SkillsMatchingService, SkillMatchResult } from '@/lib/skillsMatching';
import { DemoTask } from '@/lib/demoDatabaseFixed';
import { demoDatabase } from '@/lib/demoDatabaseFixed';

interface SkillsBasedTasksProps {
  userId: string;
  onTaskSelect?: (task: DemoTask) => void;
  appliedTasks?: Set<string>;
  externalTasks?: DemoTask[];
}

export default function SkillsBasedTasks({ userId, onTaskSelect, appliedTasks, externalTasks }: SkillsBasedTasksProps) {
  const [tasks, setTasks] = useState<DemoTask[]>([]);
  const [recommendedTasks, setRecommendedTasks] = useState<SkillMatchResult[]>([]);
  const [learningTasks, setLearningTasks] = useState<SkillMatchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [activeTab, setActiveTab] = useState<'recommended' | 'learning' | 'all'>('recommended');

  useEffect(() => {
    const allTasks = externalTasks || demoDatabase.getTasks();
    setTasks(allTasks);
    
    const recommended = SkillsMatchingService.getRecommendedTasks(userId, allTasks, 10);
    setRecommendedTasks(recommended);
    
    const learning = SkillsMatchingService.getLearningTasks(userId, allTasks, 5);
    setLearningTasks(learning);
  }, [userId, externalTasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Отличное совпадение';
      case 'medium': return 'Хорошее совпадение';
      case 'low': return 'Требует развития';
      default: return priority;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredTasks = (taskList: SkillMatchResult[]) => {
    return taskList.filter(task => {
      const matchesSearch = task.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.matchedSkills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const notApplied = !appliedTasks?.has(task.taskId);
      return matchesSearch && matchesPriority && notApplied;
    });
  };

  const TaskCard = ({ taskResult }: { taskResult: SkillMatchResult }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onTaskSelect?.(tasks.find(t => t.id === taskResult.taskId)!)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">{taskResult.taskTitle}</h3>
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-bold ${getScoreColor(taskResult.matchScore)}`}>
              {taskResult.matchScore}%
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mb-3">
          <Badge className={getPriorityColor(taskResult.priority)}>
            {getPriorityLabel(taskResult.priority)}
          </Badge>
          <Badge variant="outline">
            <Target className="w-3 h-3 mr-1" />
            {taskResult.matchedSkills.length}/{taskResult.matchedSkills.length + taskResult.missingSkills.length}
          </Badge>
        </div>
        
        {taskResult.matchedSkills.length > 0 && (
          <div className="mb-3">
            <div className="text-sm font-medium text-green-700 mb-1">Совпадающие навыки:</div>
            <div className="flex flex-wrap gap-1">
              {taskResult.matchedSkills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs bg-green-100 text-green-800">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {taskResult.missingSkills.length > 0 && (
          <div className="mb-3">
            <div className="text-sm font-medium text-orange-700 mb-1">Можно развить:</div>
            <div className="flex flex-wrap gap-1">
              {taskResult.missingSkills.map(skill => (
                <Badge key={skill} variant="outline" className="text-xs border-orange-200 text-orange-800">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 mt-3">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              const task = tasks.find(t => t.id === taskResult.taskId);
              if (task && onTaskSelect) {
                onTaskSelect(task);
              }
            }}
          >
            <Target className="w-3 h-3 mr-1" />
            Подробнее
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              // Здесь можно добавить логику для открытия AI-консультанта
              console.log('AI Assistant for task:', taskResult.taskId);
            }}
          >
            <Bot className="w-3 h-3 mr-1" />
            AI-помощник
          </Button>
        </div>
        
        <Progress value={taskResult.matchScore} className="h-2 mt-2" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Фильтры задач
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск задач..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все приоритеты</SelectItem>
                <SelectItem value="high">Отличное совпадение</SelectItem>
                <SelectItem value="medium">Хорошее совпадение</SelectItem>
                <SelectItem value="low">Требует развития</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Табы */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'recommended' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('recommended')}
          className="flex items-center gap-2"
        >
          <Star className="w-4 h-4" />
          Рекомендуемые ({recommendedTasks.length})
        </Button>
        <Button
          variant={activeTab === 'learning' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('learning')}
          className="flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Для развития ({learningTasks.length})
        </Button>
        <Button
          variant={activeTab === 'all' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('all')}
          className="flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          Все задачи ({tasks.length})
        </Button>
      </div>

      {/* Список задач */}
      <div className="space-y-4">
        {activeTab === 'recommended' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Рекомендуемые задачи
            </h3>
            {filteredTasks(recommendedTasks).length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">Нет рекомендованных задач</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTasks(recommendedTasks).map(task => (
                  <TaskCard key={task.taskId} taskResult={task} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'learning' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Задачи для развития навыков
            </h3>
            {filteredTasks(learningTasks).length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">Нет задач для развития</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTasks(learningTasks).map(task => (
                  <TaskCard key={task.taskId} taskResult={task} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Все задачи
            </h3>
            {filteredTasks(SkillsMatchingService.getTasksWithSkillMatch(userId, tasks.map(t => ({
              id: t.id,
              title: t.title,
              description: '',
              location: '',
              startTime: '',
              requiredVolunteers: 0,
              skills: [],
              urgency: 'medium',
              status: 'open',
              creatorId: '',
              invitedFriends: [],
              maxFriends: undefined,
              requiresTeam: false
            })))).length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">Задачи не найдены</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTasks(SkillsMatchingService.getTasksWithSkillMatch(userId, tasks.map(t => ({
                  id: t.id,
                  title: t.title,
                  description: '',
                  location: '',
                  startTime: '',
                  requiredVolunteers: 0,
                  skills: [],
                  urgency: 'medium',
                  status: 'open',
                  creatorId: '',
                  invitedFriends: [],
                  maxFriends: undefined,
                  requiresTeam: false
                })))).map(task => (
                  <TaskCard key={task.taskId} taskResult={task} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
