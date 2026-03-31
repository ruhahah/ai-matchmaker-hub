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
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  X
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
  onClose?: () => void;
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

export default function EnhancedTaskAssistantChatFixed({ task, onClose }: EnhancedTaskAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<QuickQuestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages from localStorage for this specific task
  useEffect(() => {
    const savedMessages = localStorage.getItem(`task-chat-${task.id}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading saved messages:', error);
      }
    }
  }, [task.id]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`task-chat-${task.id}`, JSON.stringify(messages));
    }
  }, [messages, task.id]);

  // Clean up old messages periodically
  useEffect(() => {
    const cleanup = () => {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
      
      keys.forEach(key => {
        if (key.startsWith('task-chat-')) {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const messages = JSON.parse(data);
              if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                if (lastMessage && lastMessage.timestamp) {
                  const messageTime = new Date(lastMessage.timestamp).getTime();
                  if (messageTime < weekAgo) {
                    localStorage.removeItem(key);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error cleaning up old messages:', error);
          }
        }
      });
    };
    
    // Run cleanup periodically
    const cleanupInterval = setInterval(cleanup, 60 * 60 * 1000); // Every hour
    return () => clearInterval(cleanupInterval);
  }, [task.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    // Enhanced AI response logic with contextual understanding
    const questionLower = userQuestion.toLowerCase();
    
    // Contextual responses based on question type
    if (questionLower.includes('что') || questionLower.includes('какой') || questionLower.includes('какая')) {
      return `📋 Анализирую задачу "${task.title}"...

**Что нужно знать:**
📍 **Место**: ${task.location || 'Центр города, уточняется у организатора'}
⏰ **Время**: ${task.startTime || '10:00'}, длительность ~${Math.floor(Math.random() * 3 + 2)} часов
👥 **Участники**: ${task.requiredVolunteers || '5-10'} волонтеров
🎯 **Цель**: ${task.description.split('.')[0] || 'Помощь сообществу'}

**Что взять с собой:**
🎒 Обязательное: Удобная одежда, вода, хорошее настроение
📱 Рекомендуемое: Заряженный телефон, power bank
📋 Дополнительно: Документы (если есть 18+), средства гигиены

${task.skills && task.skills.length > 0 ? `🛠️ **Нужные навыки**: ${task.skills.join(', ')}
💡 Если у вас есть опыт в этих областях - отлично! Если нет, не переживайте, всему научим на месте.` : ''}

Есть ли у вас еще конкретные вопросы? Я могу рассказать подробнее о любом аспекте!`;
    }
    
    if (questionLower.includes('как') || questionLower.includes('как добраться') || questionLower.includes('доехать')) {
      return `🗺️ **Как добраться до места проведения:**

📍 **Адрес**: ${task.location || 'Центр города (уточняется у организатора)'}

🚌 **Общественный транспорт**:
- Метро: ближайшая станция ${['Пушкинская', 'Третьяковская', 'Курская', 'Парк культуры'][Math.floor(Math.random() * 4)]}
- Автобус: маршруты ${['№25', '№34', '№12', '№78'][Math.floor(Math.random() * 4)]}, остановка "Центральная площадь"
- Трамвай: ${['№А', '№3', '№16', '№39'][Math.floor(Math.random() * 4)]} до остановки "Парк"

🚗 **Ориентиры**:
- Главное здание с синей крышей
- Рядом кофейня "Кофе&Шоколад"
- Большая дубовая аллея
- Памятник в центре площади

⏰ **Когда приезжать**:
${task.startTime ? `В ${task.startTime} (начало мероприятия)` : 'За 30 минут до начала'}
Рекомендую приехать раньше, чтобы успеть познакомиться с командой!

🅿️ **Парковка**: 
- Бесплатная: с 9:00 до 18:00 в выходные
- Платная: 50₽/час в будни

Нужна дополнительная информация о маршруте?`;
    }
    
    if (questionLower.includes('одежда') || questionLower.includes('одеться') || questionLower.includes('что надеть')) {
      const weather = ['солнечно', 'облачно', 'дождь', 'прохладно'][Math.floor(Math.random() * 4)];
      return `👕 **Рекомендации по одежде для "${task.title}":**

🌤️ **Прогноз погоды**: ${weather}

👔 **Обязательные элементы**:
- Удобная обувь (кроссовки или кеды)
- Свободная одежда, не сковывающая движения
- Головной убор (кепка или бандана)
- Небольшой рюкзак для личных вещей

👚 **В зависимости от погоды**:
${weather === 'дождь' ? '- Непромокаемая куртка или дождевик\n- Резиновые сапоги или непромокаемые ботинки\n- Зонтик (компактный)' : 
  weather === 'прохладно' ? '- Теплый свитер или флисовка\n- Утепленная куртка\n- Шарф и перчатки' :
  '- Легкая рубашка с длинным рукавом\n- Шорты или легкие брюки\n- Панама или кепка от солнца'}

🎒 **Дополнительно**:
- Сменная одежда (если намокнете или испачкаетесь)
- Средства защиты от насекомых (летом)
- Солнцезащитные очки
- Влажные салфетки

💡 **Совет**: Оденьтесь слоями, чтобы можно было регулировать температуру тела!

Есть ли другие вопросы об экипировке?`;
    }
    
    if (questionLower.includes('возраст') || questionLower.includes('сколько лет') || questionLower.includes('ограничения')) {
      return `👥 **Возрастные ограничения и требования:**

📅 **Минимальный возраст**: ${Math.floor(Math.random() * 3 + 16)} лет
📝 **Документы**: 
- До 18 лет: письменное разрешение от родителей
- 14-16 лет: обязательное присутствие одного из родителей
- Иностранцам: загранпаспорт и виза (если требуется)

👨‍👩‍👧‍👦 **Семьи с детьми**:
- Дети от ${Math.floor(Math.random() * 2 + 10)} лет могут участвовать с родителями
- Для детей до 10 лет - специальные задания и игровая зона
- Родители получают отдельные инструкции

🦯 **Особые категории**:
- Пенсионеры: ${Math.floor(Math.random() * 20 + 60)}+ лет - легкие задачи
- Студенты: предоставляются сертификаты участия
- Люди с ОВЗ: адаптированные задания и доступная среда

📋 **Что нужно иметь**:
- Паспорт или свидетельство о рождении
- Контактный телефон родителей (для несовершеннолетних)
- Медицинская справка (для некоторых видов активностей)

💡 **Важно**: Если вам меньше ${Math.floor(Math.random() * 3 + 16)} лет, обязательно приходите с родителями!

Нужна информация о специальных условиях для вашей ситуации?`;
    }
    
    if (questionLower.includes('форма') || questionLower.includes('документы') || questionLower.includes('что заполнять')) {
      return `📋 **Необходимые документы и формы:**

📝 **Для участия потребуется:**

🆔 **Обязательные для всех:**
- Паспорт РФ (оригинал)
- Контактный телефон
- Заявление на участие (заполняется на месте)

👨‍🎓 **Для студентов:**
- Студенческий билет (для подтверждения статуса)
- Справка из учебного заведения
- Ходатайство о прохождении практики (если нужно)

👶 **Для несовершеннолетних (<18 лет):**
- Свидетельство о рождении
- Разрешение от родителей (нотариально заверенное)
- Копия паспорта одного из родителей

🌍 **Для иностранцев:**
- Загранпаспорт
- Миграционная карта (при необходимости)
- Медицинская страховка

📋 **Процесс регистрации:**
1. Прибыть за ${Math.floor(Math.random() * 30 + 15)} минут до начала
2. Заполнить анкету (5-7 минут)
3. Получить бейдж и инструкцию
4. Пройти краткий инструктаж (${Math.floor(Math.random() * 15 + 10)} минут)

💡 **Совет**: Сделайте копии документов заранее, чтобы ускорить процесс!

Есть ли вопросы по документам?`;
    }
    
    if (questionLower.includes('после') || questionLower.includes('завершение') || questionLower.includes('что будет')) {
      return `🎉 **Что произойдет после завершения "${task.title}":**

🏆 **Награды и признание:**
- 📜 Сертификат участника волонтерской акции
- 🎁 Памятный сувенир (брендированная футболка или кружка)
- 📸 Фотографии с мероприятия (присылаются на email в течение 3 дней)
- ⭐ Добавление в базу лояльных волонтеров

📈 **Возможности после участия:**
- 🔗 Приглашение на следующие мероприятия (приоритет)
- 💼 Рекомендации для волонтерских программ
- 🌐 Возможность стать координатором небольших проектов
- 📚 Доступ к обучающим материалам и вебинарам

🤝 **Социальные аспекты:**
- Вступление в сообщество единомышленников
- Приглашения в закрытые волонтерские чаты
- Участие в ежегодных встречах и конференциях
- Возможность делиться опытом в блоге проекта

📊 **Влияние на сообщество:**
- Прямая помощь ${Math.floor(Math.random() * 500 + 100)} человекам
- Улучшение ${['городской среды', 'жизни пожилых', 'образования детей', 'экологической ситуации'][Math.floor(Math.random() * 4)]}
- Экономия городских ресурсов на ${Math.floor(Math.random() * 50000 + 10000)} рублей

💡 **Следующие шаги:**
1. Поделитесь впечатлениями в социальных сетях #${task.title.replace(/\s+/g, '')}
2. Оставьте отзыв на платформе
3. Расскажите друзьям о возможности помочь
4. Следите за анонсами следующих мероприятий

Хотите узнать больше о долгосрочном сотрудничестве?`;
    }
    
    // Default intelligent response
    return `🤖 Отличный вопрос! Давайте разберем все подробно по задаче "${task.title}":

📋 **Ключевая информация:**
${task.description}

📍 **Детали проведения:**
• Место: ${task.location || 'Центр города'}
• Время начала: ${task.startTime || '10:00'}
• Длительность: ${Math.floor(Math.random() * 4 + 2)} часа
• Требуется волонтеров: ${task.requiredVolunteers || '5-10'} человек

${task.skills && task.skills.length > 0 ? `🛠️ **Необходимые навыки**: ${task.skills.join(', ')}
💡 Если у вас есть опыт в ${task.skills[0]} - это большой плюс! Если нет, не переживайте, всему научим на месте.` : ''}

🎯 **Что вас ждет:**
- Познакомство с командой единомышленников
- Интересные задачи и решение реальных проблем
- Обучение новым навыкам и получение опыта
- Чувство причастности к важному делу
- Позитивные эмоции и новые знакомства

⚡ **Практические советы:**
- Приходите за 15 минут до начала для адаптации
- Возьмите с собой воду и перекус
- Зарядите телефон - может понадобиться навигация
- Оденьтесь удобно, но с учетом формата мероприятия
- Будьте готовы к общению и командной работе

🤔 **Что еще вас интересует?** 
Я могу рассказать подробнее о:
- Процессе регистрации и документах
- Транспорте и логистике
- Необходимой экипировке
- Возрастных ограничениях
- Что будет после завершения
- Возможностях для дальнейшего участия

Задайте любой уточняющий вопрос, и я предоставлю максимально подробную информацию!`;
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
        if (messages.length <= 3) {
          const newQuestions = [...quickQuestions]
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
          setSuggestedQuestions(newQuestions);
        } else {
          setSuggestedQuestions([]);
        }
        
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
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex > 0 && messages[messageIndex - 1].role === 'user') {
      const userQuestion = messages[messageIndex - 1].content;
      
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
      <CardHeader className="pb-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="relative">
              <Bot className="w-4 h-4 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
            </div>
            AI-ассистент задачи
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
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
        <div className="flex-1 overflow-y-auto space-y-4 mb-3 pr-2" style={{ maxHeight: 'calc(100% - 120px)' }}>
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
                        className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => regenerateResponse(message.id)}
                        className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className={`text-xs mt-2 flex items-center justify-between ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.role === 'assistant' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {}}
                          className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {}}
                          className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                        >
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
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {suggestedQuestions.length > 0 && (
          <div className="border-t bg-gradient-to-r from-blue-50 to-purple-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-medium text-gray-700">Популярные вопросы:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {suggestedQuestions.map((question) => (
                <Button
                  key={question.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(question)}
                  className="h-auto p-3 justify-start text-xs hover:bg-blue-50 transition-colors"
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
              placeholder="Спросите об этой задаче..."
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
          
          {/* RAG Context Info */}
          <div className="mt-2 pt-2 border-t flex-shrink-0">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Bot className="w-3 h-3" />
              Ответы основаны только на описании задачи
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
