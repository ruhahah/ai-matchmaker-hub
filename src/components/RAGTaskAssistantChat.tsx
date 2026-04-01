import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Bot, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[]; // Источники из RAG
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

interface RAGTaskAssistantChatProps {
  task: Task;
}

export default function RAGTaskAssistantChat({ task }: RAGTaskAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Привет! Я AI-консультант по задаче "${task.title}". Я могу отвечать только на основе информации, предоставленной организатором. Спрашивайте!`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Создаем базу знаний из описания задачи
  const createKnowledgeBase = (task: Task): Record<string, string> => {
    return {
      main_task: task.description,
      location: task.location || 'Место проведения не указано организатором',
      skills_required: (task.skills || []).length > 0 
        ? `Необходимые навыки: ${(task.skills || []).join(', ')}`
        : 'Конкретные навыки не указаны организатором',
      urgency: `Срочность: ${task.urgency || 'medium'}`,
      timing: task.startTime || task.start_time 
        ? `Время начала: ${task.startTime || task.start_time}`
        : 'Время начала не указано организатором',
      volunteers_needed: task.requiredVolunteers 
        ? `Требуется волонтеров: ${task.requiredVolunteers}`
        : 'Количество волонтеров не указано организатором'
    };
  };

  // Поиск релевантной информации в базе знаний
  const retrieveRelevantInfo = (query: string, knowledgeBase: Record<string, string>): { info: string; sources: string[] } => {
    const queryWords = query.toLowerCase().split(' ');
    const relevantInfo: string[] = [];
    const sources: string[] = [];

    // Поиск по ключевым словам
    Object.entries(knowledgeBase).forEach(([key, value]) => {
      const keyWords = key.toLowerCase().split('_');
      const valueWords = value.toLowerCase();
      
      // Проверяем релевантность по ключевым словам
      const isRelevant = queryWords.some(qWord => 
        keyWords.some(kWord => kWord.includes(qWord) || qWord.includes(kWord)) ||
        valueWords.includes(qWord)
      );

      if (isRelevant) {
        relevantInfo.push(value);
        sources.push(key);
      }
    });

    // Если ничего не найдено, возвращаем пустой результат
    if (relevantInfo.length === 0) {
      return {
        info: 'Организатор это не указал',
        sources: []
      };
    }

    return {
      info: relevantInfo.join('\n\n'),
      sources
    };
  };

  // Генерация ответа на основе найденной информации
  const generateResponse = (query: string, retrievedInfo: { info: string; sources: string[] }): string => {
    if (retrievedInfo.info === 'Организатор это не указал') {
      return 'К сожалению, организатор не указал эту информацию в описании задачи.';
    }

    // Анализируем тип вопроса и формируем ответ
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('что') || queryLower.includes('задача') || queryLower.includes('суть')) {
      return `📋 **Суть задачи:** ${retrievedInfo.info}`;
    }
    
    if (queryLower.includes('где') || queryLower.includes('место') || queryLower.includes('локаци') || queryLower.includes('адрес')) {
      return `📍 **Место проведения:** ${retrievedInfo.info}`;
    }
    
    if (queryLower.includes('навык') || queryLower.includes('умение') || queryLower.includes('опыт') || queryLower.includes('требует')) {
      return `🛠️ **Требования к навыкам:** ${retrievedInfo.info}`;
    }
    
    if (queryLower.includes('время') || queryLower.includes('когда') || queryLower.includes('начало') || queryLower.includes('дедлайн')) {
      return `⏰ **Время проведения:** ${retrievedInfo.info}`;
    }
    
    if (queryLower.includes('сколько') || queryLower.includes('волонтер') || queryLower.includes('людей')) {
      return `👥 **Количество участников:** ${retrievedInfo.info}`;
    }
    
    if (queryLower.includes('срочно') || queryLower.includes('срочность')) {
      return `⚡ **Срочность:** ${retrievedInfo.info}`;
    }

    // Общий ответ для других вопросов
    return `ℹ️ **Информация по задаче:** ${retrievedInfo.info}`;
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, 100);
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
      // RAG процесс: 1. Извлечение информации 2. Генерация ответа
      const knowledgeBase = createKnowledgeBase(task);
      const retrievedInfo = retrieveRelevantInfo(input.trim(), knowledgeBase);
      const response = generateResponse(input.trim(), retrievedInfo);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        sources: retrievedInfo.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
      scrollToBottom();

    } catch (error) {
      console.error('Error in RAG process:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Произошла ошибка при обработке запроса. Попробуйте переформулировать вопрос.',
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

  return (
    <div className="flex flex-col h-[500px]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
          <Bot className="w-5 h-5" />
          AI-консультант задачи
        </CardTitle>
        <div className="text-sm text-gray-600">
          Отвечаю только на основе информации от организатора
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 h-[350px]">
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-3",
                    message.role === 'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Источник: {message.sources.join(', ')}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs mt-1 opacity-70">
                    {message.role === 'user' ? 'Вы' : 'AI'} • {message.timestamp.toLocaleTimeString('ru-RU', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-gray-100">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Анализирую информацию...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-white shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Спросите про детали задачи..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
