import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Bot, Loader2 } from 'lucide-react';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generatePersonalizedResponse = (userQuestion: string, task: Task): string => {
    const questionWords = userQuestion.toLowerCase().split(' ');
    
    // Простые шаблоны для fallback
    const responseTemplates = {
      about: `🎯 **Основная задача:** ${task.description}\n\nВаша роль в этом проекте - ${(task.skills || [])[0] || 'помощник'} в ${task.location || 'указанном месте'}. Это отличная возможность применить ваши навыки!`,
      location: `🗺️ **Место проведения:** ${task.location || 'Уточняется у организатора'}\n\nРекомендую приехать за 15 минут до начала.`,
      skills: `🛠️ **Необходимые навыки:** ${(task.skills || []).join(', ')}\n\n${(task.skills || [])[0] ? `Ваш опыт в ${(task.skills || [])[0]} будет ключом к успеху!` : 'Подойдет любой желающий помочь!'}`,
      urgency: `⚡ **Срочность:** ${task.urgency || 'medium'}\n\n${task.urgency === 'high' ? '🔥 СРОЧНО! Нужна немедленная помощь.' : '📅 Плановая задача.'}`,
      default: `🎯 **О задаче:** ${task.title}\n\n${task.description}\n\nЭто важный проект! Ваш вклад очень ценен.`
    };

    // Определение категории вопроса
    if (questionWords.some(word => ['что', 'задача', 'суть', 'смысл'].includes(word))) {
      return responseTemplates.about;
    } else if (questionWords.some(word => ['где', 'место', 'локаци', 'адрес'].includes(word))) {
      return responseTemplates.location;
    } else if (questionWords.some(word => ['навык', 'умение', 'опыт', 'научить'].includes(word))) {
      return responseTemplates.skills;
    } else if (questionWords.some(word => ['срочно', 'дедлайн', 'когда', 'время'].includes(word))) {
      return responseTemplates.urgency;
    } else {
      return responseTemplates.default;
    }
  };

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
      // Вызов OpenAI API для генерации ответа
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Ты - полезный AI-ассистент для волонтеров. Отвечай на русском языке кратко и по делу. Используй эмодзи для лучшего восприятия. Контекст задачи:
              
              Название: ${task.title}
              Описание: ${task.description}
              Место: ${task.location || 'Не указано'}
              Навыки: ${(task.skills || []).join(', ')}
              Срочность: ${task.urgency || 'medium'}
              Время: ${task.startTime || task.start_time || 'Не указано'}
              
              Отвечай на вопросы волонтера о этой задаче. Будь дружелюбным и полезным.`
            },
            {
              role: 'user',
              content: input.trim()
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'Извините, не удалось сгенерировать ответ.';

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Explicit scroll after AI response
      setTimeout(() => {
        scrollToBottom();
      }, 200);

    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      // Fallback к шаблонным ответам если API недоступен
      const fallbackResponse = generatePersonalizedResponse(input.trim(), task);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Explicit scroll for fallback response
      setTimeout(() => {
        scrollToBottom();
      }, 200);
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
    <Card className="w-full h-[500px] flex flex-col">
      <CardHeader className="pb-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-600" />
            AI-ассистент задачи
          </CardTitle>
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

      <CardContent className="flex-1 flex flex-col p-3 min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2" style={{ maxHeight: 'calc(100% - 120px)' }}>
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
                <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
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
        <div className="flex gap-2 flex-shrink-0">
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
        <div className="mt-2 pt-2 border-t flex-shrink-0">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Bot className="w-3 h-3" />
            Ответы основаны только на описании задачи
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
