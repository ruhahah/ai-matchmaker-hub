import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Brain, Eye } from 'lucide-react';

interface AiVerificationStatusProps {
  status: 'approved' | 'rejected' | 'pending';
  aiReason?: string;
  compact?: boolean;
}

export default function AiVerificationStatus({ 
  status, 
  aiReason, 
  compact = false 
}: AiVerificationStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          bgClass: 'bg-gradient-to-r from-green-500 to-emerald-600',
          icon: CheckCircle,
          iconClass: 'text-white',
          textClass: 'text-white',
          label: '✅ Подтверждено',
          description: 'AI подтвердил выполнение работы'
        };
      case 'rejected':
        return {
          bgClass: 'bg-gradient-to-r from-red-500 to-rose-600',
          icon: XCircle,
          iconClass: 'text-white',
          textClass: 'text-white',
          label: '❌ Отклонено',
          description: 'AI не обнаружил подтверждения выполнения'
        };
      case 'pending':
        return {
          bgClass: 'bg-gradient-to-r from-yellow-500 to-amber-600',
          icon: AlertTriangle,
          iconClass: 'text-white',
          textClass: 'text-white',
          label: '⏳ В обработке',
          description: 'AI анализирует доказательство'
        };
      default:
        return {
          bgClass: 'bg-gradient-to-r from-gray-500 to-slate-600',
          icon: Eye,
          iconClass: 'text-white',
          textClass: 'text-white',
          label: '🔍 Неизвестно',
          description: 'Статус не определен'
        };
    }
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.bgClass}`}>
        <config.icon className={`w-3 h-3 ${config.iconClass}`} />
        <span className={config.textClass}>{config.label}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border-2 p-4 ${config.bgClass} bg-opacity-10`}>
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Brain className="w-4 h-4 text-neutral-900" />
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 text-sm">
              AI Верификация
            </h4>
            <p className="text-neutral-700 text-xs mt-1 leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>
        
        {aiReason && (
          <div className="flex-1 min-w-0">
            <div className="bg-blue-50 border border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-900">AI Анализ</span>
              </div>
              <p className="text-blue-800 text-xs leading-relaxed">
                {aiReason}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
