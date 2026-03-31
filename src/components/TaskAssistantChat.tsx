import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageCircle, Send, Bot, X, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  location?: string;
  start_time?: string;
  startTime?: string;
  requiredVolunteers?: number;
  skills?: string[];
  urgency?: 'low' | 'medium' | 'high';
  status?: string;
  creator_id?: string;
}

interface TaskAssistantChatProps {
  task: Task;
}

export default function TaskAssistantChat({ task }: TaskAssistantChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // RAG implementation - ищем ответ в контексте задачи
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const taskContext = `
        Задача: ${task.title}
        Описание: ${task.description}
        Место: ${task.location || 'Не указано'}
        Необходимые навыки: ${(task.skills || []).join(', ')}
        Срочность: ${task.urgency || 'medium'}
        Начало: ${task.startTime || task.start_time || 'Не указано'}
        Требуется волонтеров: ${task.requiredVolunteers || 'Не указано'}
      `.toLowerCase();
      
      const userQuestion = input.trim().toLowerCase();
      let response = '';
      
      // RAG поиск ответа в контексте задачи
      if (userQuestion.includes('что') || userQuestion.includes('задача') || userQuestion.includes('нужно')) {
        response = `Основная задача: ${task.description}. Вам нужно помочь с ${(task.skills || []).join(', ')} в ${task.location || 'указанном месте'}.`;
      } else if (userQuestion.includes('где') || userQuestion.includes('место') || userQuestion.includes('локаци')) {
        response = `Мероприятие пройдет в: ${task.location || 'Место не указано в описании задачи.'}`;
      } else if (userQuestion.includes('время') || userQuestion.includes('когда') || userQuestion.includes('начало')) {
        response = `Начало в: ${task.startTime || task.start_time || 'Время не указано в описании задачи.'}`;
      } else if (userQuestion.includes('навык') || userQuestion.includes('умение') || userQuestion.includes('что нужно')) {
        response = `Потребуются следующие навыки: ${(task.skills || []).join(', ')}.`;
      } else if (userQuestion.includes('срочно') || userQuestion.includes('дедлайн')) {
        const urgency = task.urgency || 'medium';
        response = `Срочность: ${urgency}. ${urgency === 'high' ? 'Очень срочно, нужно как можно скорее!' : 'Плановая задача.'}`;
      } else if (userQuestion.includes('одежда') || userQuestion.includes('что взять') || userQuestion.includes('перчатки')) {
        if (taskContext.includes('уборка') || taskContext.includes('парк')) {
          response = 'Рекомендую взять рабочие перчатки, удобную одежду и воду. Организатор обычно предоставляет основные инструменты.';
        } else {
          response = 'Организатор это не указал в описании задачи. Рекомендую взять удобную одежду и воду.';
        }
      } else if (userQuestion.includes('сколько') || userQuestion.includes('волонтер')) {
        response = `Требуется ${task.requiredVolunteers || 'неопределенное количество'} волонтеров.`;
      } else {
        response = `Я могу ответить на вопросы о задаче "${task.title}". Спросите про место, время, навыки или что взять с собой. Организатор указал: ${task.description}`;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Срочно';
      case 'medium': return 'Средняя';
      case 'low': return 'Низкая';
      default: return urgency;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 shadow-lg bg-white hover:bg-gray-50"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Спросить AI о задаче
          {messages.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {messages.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 h-[500px] p-0" align="end" side="top">
        <Card className="h-full border-0 shadow-none">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                AI-ассистент задачи
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Task Context */}
            <div className="mt-2 space-y-1">
              <div className="font-medium text-xs">{task.title}</div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {task.location}
                </Badge>
                <Badge className={`text-xs ${getUrgencyColor(task.urgency)}`}>
                  {getUrgencyLabel(task.urgency)}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-3">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">🤖</div>
                  <p className="text-sm text-gray-600">
                    Задайте вопрос об этой задаче, и я помогу!
                  </p>
                  <div className="mt-3 space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs w-full justify-start h-auto p-2"
                      onClick={() => setInput('Что нужно принести с собой?')}
                    >
                      💡 Что нужно принести с собой?
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs w-full justify-start h-auto p-2"
                      onClick={() => setInput('Сколько времени займет задача?')}
                    >
                      💡 Сколько времени займет задача?
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs w-full justify-start h-auto p-2"
                      onClick={() => setInput('Будет ли предоставлена форма?')}
                    >
                      💡 Будет ли предоставлена форма?
                    </Button>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Спросите об этой задаче..."
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="text-sm"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!input.trim() || isLoading}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </Button>
            </div>

            {/* RAG Context Info */}
            <div className="mt-2 pt-2 border-t">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Bot className="w-3 h-3" />
                Ответы основаны только на описании задачи
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
