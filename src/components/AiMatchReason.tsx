import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';

interface AiMatchReasonProps {
  score: number;
  reason: string;
  volunteerName?: string;
  taskTitle?: string;
  compact?: boolean;
}

export default function AiMatchReason({ 
  score, 
  reason, 
  volunteerName, 
  taskTitle,
  compact = false 
}: AiMatchReasonProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-gradient-to-r from-teal-500 to-cyan-600';
    if (score >= 0.8) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (score >= 0.7) return 'bg-gradient-to-r from-yellow-500 to-orange-600';
    return 'bg-gradient-to-r from-gray-500 to-slate-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.9) return 'Отличное совпадение';
    if (score >= 0.8) return 'Хорошее совпадение';
    if (score >= 0.7) return 'Среднее совпадение';
    return 'Требуется уточнение';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge className={`${getScoreColor(score)} text-white border-0`}>
          {Math.round(score * 100)}%
        </Badge>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border-2 p-4 ${getScoreColor(score)} bg-opacity-10`}>
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Brain className="w-4 h-4 text-neutral-900" />
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 text-sm">
              AI Insight
            </h4>
            <p className="text-neutral-700 text-xs mt-1 leading-relaxed">
              {reason}
            </p>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-neutral-600">
              {volunteerName && `Кандидат: ${volunteerName}`}
              {taskTitle && ` • Задача: ${taskTitle}`}
            </div>
            <Badge variant="outline" className="text-xs">
              {getScoreLabel(score)}
            </Badge>
          </div>
          
          <div className="text-xs text-neutral-500 space-y-1">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>Анализ завершен на основе {Math.round(score * 100)}% соответствия</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>AI использовал семантический анализ профиля и задачи</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
