import React, { useState, useRef, useEffect } from 'react';
import { createTask } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, AlertCircle, Send, CheckCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TaskData {
  title: string;
  description: string;
  location: string;
  date: string;
  required_volunteers: number;
  skills: string[];
  urgency: 'low' | 'medium' | 'high';
}

interface AiResponse {
  type: 'question' | 'task_data';
  content: string | TaskData;
}

interface AiTaskCreatorProps {
  onTaskCreated?: () => void;
}

export default function AITaskCoordinator({ onTaskCreated }: AiTaskCreatorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskData, setTaskData] = useState<TaskData | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
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
      // Mock AI response for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAiResponse = {
        content: {
          title: "Помощь в организации эко-субботника",
          description: "Нужны волонтеры для уборки парка и посадки деревьев",
          skills: ["Экология", "Работа на свежем воздухе", "Уборка"],
          urgency: "medium" as const,
          location: "Центральный парк",
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          required_volunteers: 10
        }
      };

      const assistantMessage: Message = {
        role: 'assistant',
        content: typeof mockAiResponse.content === 'string' 
          ? mockAiResponse.content 
          : JSON.stringify(mockAiResponse.content, null, 2),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setTaskData(mockAiResponse.content);

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

  const publishTask = async () => {
    if (!taskData || isPublishing) return;

    setIsPublishing(true);

    try {
      // Mock user ID for demo
      const mockUserId = 'mock-organizer-1';

      const newTask = await createTask({
        creator_id: mockUserId,
        title: taskData.title,
        description: taskData.description,
        location: taskData.location,
        skills: taskData.skills,
        status: 'open',
        startTime: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

      // Mock AI matching call
      console.log('AI matching triggered for task:', newTask.id);

      // Reset component
      setMessages([]);
      setTaskData(null);
      setInput('');

      // Show success message
      const successMessage: Message = {
        role: 'assistant',
        content: `✅ Задача "${taskData.title}" успешно опубликована! Волонтеры уже получают уведомления.`,
        timestamp: new Date()
      };
      
      setMessages([successMessage]);

      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated();
      }

    } catch (error) {
      console.error('Error publishing task:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Ошибка при публикации задачи. Попробуйте еще раз.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsPublishing(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setTaskData(null);
    setInput('');
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
    <div className="max-w-4xl mx-auto p-6">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">
              🤖 AI-координатор задач
            </CardTitle>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetConversation}
                className="text-sm"
              >
                Новая задача
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Опишите вашу идею простыми словами, а я помогу оформить ее как задачу
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">👋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Привет! Я ваш AI-координатор
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Расскажите, какую социальную задачу вы хотите организовать. 
                  Например: "хочу собрать людей убрать мусор в парке"
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {/* Task Preview */}
            {taskData && (
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <CardTitle className="text-lg text-green-900">
                      Готово к публикации!
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{taskData.title}</h4>
                    <p className="text-gray-700 mt-1">{taskData.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{taskData.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{new Date(taskData.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{taskData.required_volunteers} волонтеров</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getUrgencyColor(taskData.urgency)}>
                        {getUrgencyLabel(taskData.urgency)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Нужные навыки:</div>
                    <div className="flex flex-wrap gap-1">
                      {taskData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={publishTask}
                      disabled={isPublishing}
                      className="flex-1"
                    >
                      {isPublishing ? 'Публикация...' : 'Опубликовать задачу'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={resetConversation}
                      disabled={isPublishing}
                    >
                      Изменить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {!taskData && (
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Опишите вашу задачу..."
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-gray-600">AI думает...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
