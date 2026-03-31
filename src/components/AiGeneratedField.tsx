import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lightbulb, Edit3, CheckCircle } from 'lucide-react';

interface AiGeneratedFieldProps {
  value: string;
  type: 'title' | 'date' | 'skills' | 'location' | 'urgency';
  isAiGenerated?: boolean;
  onEdit?: (value: string) => void;
  compact?: boolean;
}

export default function AiGeneratedField({ 
  value, 
  type, 
  isAiGenerated = false, 
  onEdit,
  compact = false 
}: AiGeneratedFieldProps) {
  const getIcon = () => {
    switch (type) {
      case 'title': return Lightbulb;
      case 'date': return CheckCircle;
      case 'skills': return Sparkles;
      case 'location': return Edit3;
      case 'urgency': return Sparkles;
      default: return Sparkles;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'title': return 'Название';
      case 'date': return 'Дата';
      case 'skills': return 'Навыки';
      case 'location': return 'Локация';
      case 'urgency': return 'Срочность';
      default: return 'Поле';
    }
  };

  const Icon = getIcon();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Icon className="w-3 h-3 text-blue-600" />
        <span className="text-sm text-gray-700">{value}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-blue-100">
            <Icon className="w-3 h-3 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">{getLabel()}</span>
        </div>
        
        {isAiGenerated && (
          <Badge variant="secondary" className="text-xs">
            ✨ AI сгенерировано
          </Badge>
        )}
      </div>
      
      <div className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200">
        {value}
      </div>
      
      {onEdit && (
        <button
          onClick={() => onEdit(value)}
          className="text-xs text-blue-600 hover:text-blue-800 underline mt-2"
        >
          Редактировать
        </button>
      )}
    </div>
  );
}
