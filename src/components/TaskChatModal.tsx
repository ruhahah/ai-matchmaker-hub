import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, X } from 'lucide-react';
import TaskAssistantChat from './TaskAssistantChat';

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
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              AI-ассистент задачи
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Task Context */}
          <div className="mt-3 space-y-2">
            <div className="font-medium">{task.title}</div>
            <div className="flex flex-wrap gap-2">
              {task.location && (
                <Badge variant="outline" className="text-xs">
                  📍 {task.location}
                </Badge>
              )}
              <Badge className={`text-xs ${getUrgencyColor(task.urgency)}`}>
                {getUrgencyLabel(task.urgency)}
              </Badge>
              {task.skills && task.skills.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  🛠️ {task.skills.slice(0, 3).join(', ')}
                  {task.skills.length > 3 && ` +${task.skills.length - 3}`}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 mt-4">
          <TaskAssistantChat task={task} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
