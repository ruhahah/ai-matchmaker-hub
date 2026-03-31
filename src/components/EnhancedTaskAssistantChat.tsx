import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  Loader2, 
  Sparkles, 
  Clock,
  MapPin,
  Users,
  AlertCircle,
  Lightbulb,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id: string;
  isTyping?: boolean;
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

interface QuickQuestion {
  id: string;
  text: string;
  icon: string;
  category: 'preparation' | 'timing' | 'requirements' | 'skills';
}

interface EnhancedTaskAssistantChatProps {
  task: Task;
}

const quickQuestions: QuickQuestion[] = [
  { id: '1', text: 'Что нужно принести с собой?', icon: '🎒', category: 'preparation' },
  { id: '2', text: 'Сколько времени займет задача?', icon: '⏰', category: 'timing' },
  { id: '3', text: 'Какие навыки нужны?', icon: '🛠️', category: 'skills' },
  { id: '4', text: 'Будет ли предоставлена форма?', icon: '📋', category: 'requirements' },
  { id: '5', text: 'Есть ли возрастные ограничения?', icon: '👥', category: 'requirements' },
  { id: '6', text: 'Как добраться до места?', icon: '🗺️', category: 'preparation' },
  { id: '7', text: 'Что будет после завершения?', icon: '🎉', category: 'timing' },
];

export default function EnhancedTaskAssistantChat({ task }: EnhancedTaskAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<QuickQuestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Привет! Я ваш AI-ассистент по задаче "${task.title}". 

Я могу помочь вам с любой информацией об этой задаче. Задайте ваш вопрос или выберите один из популярных вопросов ниже!`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    
    // Show random quick questions
    const shuffled = [...quickQuestions].sort(() => Math.random() - 0.5);
    setSuggestedQuestions(shuffled.slice(0, 3));
  }, [task.title]);

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

  const generateResponse = async (userQuestion: string): Promise<string> => {
    // Simulate AI response with context about the task
    const responses = [
      `На основе описания задачи "${task.title}": ${task.description}. 
      
📍 **Место проведения**: ${task.location || 'Уточняется'}
⏰ **Требуемое время**: Примерно ${Math.floor(Math.random() * 4 + 1)} часов
👥 **Требования**: Возраст от ${Math.floor(Math.random() * 5 + 16)} лет
🎒 **Что взять с собой**: Удобная одежда, вода, хороший настроение!

${task.skills && task.skills.length > 0 ? `🛠️ **Нужные навыки**: ${task.skills.join(', ')}` : ''}

Есть ли у вас еще вопросы? Я готов помочь!`,

      `Отличный вопрос! Давайте разберем все по порядку:

📋 **Про задача**: ${task.title}
📍 **Локация**: ${task.location || 'Центр города'}
⭐ **Сложность**: ${task.urgency === 'high' ? 'Высокая' : 'Средняя'}

🎯 **Что нужно знать**:
- Задача рассчитана на ${task.requiredVolunteers || 5} волонтеров
- Начало в ${task.startTime || '10:00'}
- Предусмотрен перерыв и обед

💡 **Совет**: Рекомендую приехать за 15 минут до начала для знакомства с командой!

Что еще вас интересует?`,

      `Анализирую информацию о задаче "${task.title}"...

🔍 **Ключевая информация**:
- **Статус**: ${task.status || 'Открыта'}
- **Срочность**: ${getUrgencyLabel(task.urgency)}
- **Необходимые люди**: ${task.requiredVolunteers || 'не указано'}

📝 **Детальное описание**:
${task.description}

🎯 **Рекомендации**:
- Проверьте прогноз погоды перед выходом
- Зарядите телефон и возьмите power bank
- Оденьтесь удобно, но с учетом формата мероприятия

Нужна дополнительная информация?`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    // Simulate AI typing
    setTimeout(async () => {
      try {
        const response = await generateResponse(input);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update suggested questions based on context
        const newQuestions = [...quickQuestions]
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        setSuggestedQuestions(newQuestions);
        
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '😕 Извините, произошла ошибка. Попробуйте задать вопрос еще раз.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickQuestion = (question: QuickQuestion) => {
    setInput(question.text);
    inputRef.current?.focus();
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // Show toast or feedback
  };

  const regenerateResponse = async (messageId: string) => {
    // Find the user message that triggered this response and regenerate
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex > 0 && messages[messageIndex - 1].role === 'user') {
      const userQuestion = messages[messageIndex - 1].content;
      
      // Remove the current response and show loading
      setMessages(prev => prev.slice(0, messageIndex));
      setIsLoading(true);
      setIsTyping(true);

      setTimeout(async () => {
        try {
          const response = await generateResponse(userQuestion);
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '😕 Не удалось перегенерировать ответ. Попробуйте еще раз.',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
          setIsTyping(false);
        }
      }, 1000);
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col shadow-lg border-0 bg-gradient-to-br from-slate-50 to-blue-50">
      <CardHeader className="pb-3 border-b bg-white/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="relative">
              <Bot className="w-4 h-4 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
            </div>
            AI-ассистент задачи
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMessages([])}
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Очистить
          </Button>
        </div>
        
        {/* Enhanced Task Context */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-sm">{task.title}</h4>
            <Badge className={`text-xs ${getUrgencyColor(task.urgency)}`}>
              {getUrgencyLabel(task.urgency)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {task.location || 'Уточняется'}
            </div>
            {task.requiredVolunteers && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {task.requiredVolunteers} волонтеров
              </div>
            )}
            {task.startTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.startTime}
              </div>
            )}
          </div>
          {task.skills && task.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ maxHeight: 'calc(100% - 140px)' }}>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm text-gray-600 mb-4">
                Начните диалог с AI-ассистентом
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className="flex gap-2 max-w-[85%]">
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`relative rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                        : 'bg-white border border-gray-200 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {message.content}
                    </div>
                    
                    {/* Message Actions */}
                    {message.role === 'assistant' && (
                      <div className="absolute -bottom-2 -right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(message.content)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => regenerateResponse(message.id)}
                          className="h-6 w-6 p-0"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    
                    <div className={`text-xs mt-2 flex items-center gap-2 ${
                      message.role === 'user' ? 'text-blue-100 justify-end' : 'text-gray-500'
                    }`}>
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.role === 'assistant' && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs">
                        Вы
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex gap-2 max-w-[85%]">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {suggestedQuestions.length > 0 && messages.length <= 2 && (
          <div className="border-t bg-gray-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-medium text-gray-700">Популярные вопросы:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {suggestedQuestions.map((question) => (
                <Button
                  key={question.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(question)}
                  className="h-auto p-2 justify-start text-xs"
                >
                  <span className="mr-2">{question.icon}</span>
                  {question.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Input */}
        <div className="border-t bg-white p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Задайте ваш вопрос..."
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="text-sm flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading}
              size="sm"
              className="px-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Context Info */}
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <AlertCircle className="w-3 h-3" />
            <span>AI отвечает на основе описания задачи. Для точной информации свяжитесь с организатором.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
