import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Clock, Users, Zap, Star, Filter } from 'lucide-react';
import { taskTemplates, templateCategories, findTemplateByKeywords, type TaskTemplate } from '@/lib/taskTemplates';
import { cn } from '@/lib/utils';

interface TaskTemplatesProps {
  onTemplateSelect: (template: TaskTemplate) => void;
  className?: string;
}

export default function TaskTemplates({ onTemplateSelect, className }: TaskTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredTemplates, setFilteredTemplates] = useState<TaskTemplate[]>(taskTemplates);

  // Фильтрация шаблонов
  React.useEffect(() => {
    let filtered = taskTemplates;

    // Фильтр по поиску
    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.keywords.some(keyword => keyword.includes(searchQuery.toLowerCase()))
      );
    }

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, selectedCategory]);

  // Автоматический подбор шаблона по тексту
  const handleAutoDetect = (text: string) => {
    const detectedTemplate = findTemplateByKeywords(text);
    if (detectedTemplate) {
      onTemplateSelect(detectedTemplate);
      setSearchQuery(detectedTemplate.name);
    }
  };

  const getDifficultyColor = (difficulty: TaskTemplate['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
    }
  };

  const getDifficultyText = (difficulty: TaskTemplate['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'Легко';
      case 'medium': return 'Средне';
      case 'hard': return 'Сложно';
    }
  };

  const getUrgencyColor = (urgency: TaskTemplate['defaultUrgency']) => {
    switch (urgency) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
    }
  };

  const getUrgencyText = (urgency: TaskTemplate['defaultUrgency']) => {
    switch (urgency) {
      case 'low': return 'Низкая';
      case 'medium': return 'Средняя';
      case 'high': return 'Высокая';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Поиск и фильтры */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Поиск шаблонов или вставьте текст для автоопределения..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Автоопределение при вставке текста
              if (e.target.value.length > 10) {
                handleAutoDetect(e.target.value);
              }
            }}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            const randomTemplate = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
            onTemplateSelect(randomTemplate);
          }}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Случайный
        </Button>
      </div>

      {/* Фильтр по категориям */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          Все категории
        </Button>
        {templateCategories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Список шаблонов */}
      <ScrollArea className="h-[400px]">
        <div className="grid gap-3 md:grid-cols-2">
          {filteredTemplates.map(template => (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
              onClick={() => onTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTemplateSelect(template);
                    }}
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </p>
                
                {/* Метаданные */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {getDifficultyText(template.difficulty)}
                  </Badge>
                  <Badge className={getUrgencyColor(template.defaultUrgency)}>
                    {getUrgencyText(template.defaultUrgency)}
                  </Badge>
                </div>
                
                {/* Детали */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {template.estimatedDuration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {template.volunteerCount} волонтеров
                  </div>
                </div>
                
                {/* Навыки */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700">Нужные навыки:</div>
                  <div className="flex flex-wrap gap-1">
                    {template.defaultSkills.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {template.defaultSkills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.defaultSkills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Локация */}
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  📍 {template.defaultLocation}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>Шаблоны не найдены</p>
            <p className="text-sm">Попробуйте изменить поисковый запрос или категорию</p>
          </div>
        )}
      </ScrollArea>

      {/* Статистика */}
      <div className="text-xs text-gray-500 text-center">
        Найдено шаблонов: {filteredTemplates.length} из {taskTemplates.length}
      </div>
    </div>
  );
}
