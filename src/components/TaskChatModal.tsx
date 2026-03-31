import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, X, Sparkles, MapPin, Users, Clock } from 'lucide-react';
import EnhancedTaskAssistantChat from './EnhancedTaskAssistantChatFixed';

interface Task {
  id: string;
  title: string;
  description: string;
  location?: string;
  startTime?: string;
  requiredVolunteers?: number;
  skills?: string[];
  urgency?: 'low' | 'medium' | 'high';
}

interface TaskChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function TaskChatModal({ isOpen, onClose, task }: TaskChatModalProps) {
  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyLabel = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'Срочно';
      case 'medium': return 'Средняя';
      case 'low': return 'Низкая';
      default: return urgency || 'Средняя';
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <DialogHeader className="flex-shrink-0 border-b bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className="relative">
                <Bot className="w-5 h-5 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <div className="font-semibold">AI-ассистент задачи</div>
                <div className="text-sm text-gray-600">Умная помощь по вашей задаче</div>
              </div>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Enhanced Task Context */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold">{task.title}</h3>
              <Badge className={`text-sm px-3 py-1 ${getUrgencyColor(task.urgency)}`}>
                {getUrgencyLabel(task.urgency)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              {task.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{task.location}</span>
                </div>
              )}
              {task.requiredVolunteers && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{task.requiredVolunteers} волонтеров нужно</span>
                </div>
              )}
              {task.startTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Начало в {task.startTime}</span>
                </div>
              )}
            </div>
            
            {task.skills && task.skills.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Требуемые навыки:</div>
                <div className="flex flex-wrap gap-2">
                  {task.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs px-2 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">AI готов ответить на любые вопросы о задаче</span>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 mt-4">
          <EnhancedTaskAssistantChat task={task} onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
