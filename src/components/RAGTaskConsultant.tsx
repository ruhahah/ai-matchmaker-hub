import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bot, Send, User, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { OpenAI } from 'openai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  urgency: 'low' | 'medium' | 'high';
  requiredVolunteers: number;
  startTime: string;
  creatorId: string;
}

interface RAGTaskConsultantProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export default function RAGTaskConsultant({ task, isOpen, onClose }: RAGTaskConsultantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // Инициализация при открытии
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Здравствуйте! Я AI-консультант по задаче "${task.title}". 
        
Я могу ответить на вопросы только на основе информации, которую предоставил организатор. Спрашивайте о деталях задачи, требованиях, месте проведения и т.д.

Что вас интересует?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, task.title, messages.length]);

  // Автоскролл к новым сообщениям
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // RAG - извлечение релевантной информации из задачи
  const extractRelevantInfo = (query: string): { info: string; sources: string[] } => {
    const taskContext = {
      title: task.title,
      description: task.description,
      skills: task.skills,
      location: task.location,
      urgency: task.urgency,
      requiredVolunteers: task.requiredVolunteers,
      startTime: task.startTime
    };

    const sources: string[] = [];
    let relevantInfo = '';

    // Анализ запроса и извлечение релевантной информации
    const queryLower = query.toLowerCase();

    // Проверка mentions разных аспектов задачи
    if (queryLower.includes('перчатк') || queryLower.includes('средств') || queryLower.includes('защит') || queryLower.includes('одежд') || queryLower.includes('обув')) {
      if (task.description.toLowerCase().includes('перчатк') || task.description.toLowerCase().includes('средств')) {
        sources.push('description');
        relevantInfo += '• Из описания задачи: ' + extractSentenceContaining(task.description, ['перчатк', 'средств', 'защит']) + '\n';
      }
    }

    if (queryLower.includes('мест') || queryLower.includes('где') || queryLower.includes('локаци') || queryLower.includes('адрес')) {
      sources.push('location');
      relevantInfo += `• Место проведения: ${task.location}\n`;
    }

    if (queryLower.includes('врем') || queryLower.includes('когда') || queryLower.includes('начал') || queryLower.includes('дл')) {
      sources.push('time');
      relevantInfo += `• Время начала: ${task.startTime}\n`;
    }

    if (queryLower.includes('навык') || queryLower.includes('умен') || queryLower.includes('требован') || queryLower.includes('нужн')) {
      sources.push('skills');
      relevantInfo += `• Требуемые навыки: ${task.skills.join(', ')}\n`;
    }

    if (queryLower.includes('срочн') || queryLower.includes('важн') || queryLower.includes('приоритет')) {
      sources.push('urgency');
      const urgencyMap = {
        'high': 'Высокая - задача очень срочная',
        'medium': 'Средняя - умеренная срочность',
        'low': 'Низкая - нет спешки'
      };
      relevantInfo += `• Срочность: ${urgencyMap[task.urgency]}\n`;
    }

    if (queryLower.includes('волонтер') || queryLower.includes('люд') || queryLower.includes('участник') || queryLower.includes('сколько')) {
      sources.push('volunteers');
      relevantInfo += `• Требуется волонтеров: ${task.requiredVolunteers}\n`;
    }

    // Если не найдено конкретной информации, добавляем общее описание
    if (!relevantInfo) {
      sources.push('description');
      relevantInfo += `• Общее описание: ${task.description}\n`;
    }

    return { info: relevantInfo.trim(), sources };
  };

  // Извлечение предложения содержащего ключевые слова
  const extractSentenceContaining = (text: string, keywords: string[]): string => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    for (const sentence of sentences) {
      for (const keyword of keywords) {
        if (sentence.toLowerCase().includes(keyword)) {
          return sentence.trim();
        }
      }
    }
    return text; // Fallback to full text
  };

  // Генерация ответа с использованием RAG
  const generateRAGResponse = async (query: string): Promise<{ content: string; sources: string[] }> => {
    try {
      // Шаг 1: Извлечение релевантной информации
      const { info, sources } = extractRelevantInfo(query);

      // Шаг 2: Проверка, есть ли релевантная информация
      if (!info || info.trim().length === 0) {
        return {
          content: '❌ *Извините, организатор не указал эту информацию в описании задачи.*\n\nЯ могу ответить только на основе предоставленных данных. Попробуйте спросить о месте проведения, времени, требуемых навыках или других деталях, которые указаны в описании задачи.',
          sources: []
        };
      }

      // Шаг 3: Генерация ответа на основе извлеченной информации
      const systemPrompt = `Ты - AI-консультант по волонтерским задачам. Твоя задача - отвечать на вопросы волонтеров ТОЛЬКО на основе предоставленной информации о задаче.

Правила:
1. Отвечай строго на основе предоставленной информации
2. Если информация не полная - так и скажи
3. Не добавляй информацию, которой нет в задании
4. Будь вежливым и helpful
5. Используй эмодзи для лучшего понимания
6. Структурируй ответ четко и по делу

Контекст задачи:
Название: ${task.title}
Описание: ${task.description}
Место: ${task.location}
Время: ${task.startTime}
Навыки: ${task.skills.join(', ')}
Срочность: ${task.urgency}
Нужно волонтеров: ${task.requiredVolunteers}

Релевантная информация для ответа:
${info}

Отвечай на вопрос: "${query}"`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const response = completion.choices[0]?.message?.content || 'Извините, не удалось сгенерировать ответ.';

      return {
        content: response,
        sources
      };

    } catch (error) {
      console.error('RAG response generation error:', error);
      return {
        content: '❌ *Произошла ошибка при обработке запроса.*\n\nПожалуйста, попробуйте еще раз.',
        sources: []
      };
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateRAGResponse(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        sources: response.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ *Произошла ошибка. Попробуйте еще раз.*',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSourceLabel = (source: string): string => {
    const labels = {
      'description': 'Описание задачи',
      'location': 'Место проведения',
      'time': 'Время',
      'skills': 'Навыки',
      'urgency': 'Срочность',
      'volunteers': 'Волонтеры'
    };
    return labels[source as keyof typeof labels] || source;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="w-5 h-5" />
            AI-Консультант задачи
            <Badge variant="outline" className="text-xs">RAG</Badge>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Задача: {task.title}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Сообщения */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                    <div className={`rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-muted'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      
                      {/* Источники информации */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-current/20">
                          <div className="flex items-center gap-1 text-xs opacity-70">
                            <Sparkles className="w-3 h-3" />
                            <span>Источник: {message.sources.map(getSourceLabel).join(', ')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1 px-1">
                      {message.timestamp.toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 order-2">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Ввод сообщения */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Задайте вопрос о задаче..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Подсказка */}
            <div className="mt-2 text-xs text-muted-foreground">
              💡 Совет: Спрашивайте о месте, времени, требуемых навыках, необходимом оборудовании
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
