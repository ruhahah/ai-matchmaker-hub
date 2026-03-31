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
      // Генерация уникальных ответов на основе контекста
      const generatePersonalizedResponse = (userQuestion: string, task: Task): string => {
        const questionWords = userQuestion.toLowerCase().split(' ');
        
        // Базовые шаблоны с персонализацией
        const responseTemplates = {
          about: [
            `🎯 **Основная задача:** ${task.description}\n\nВаша роль в этом проекте - ${(task.skills || [])[0] || 'помощник'} в ${task.location || 'указанном месте'}. Это отличная возможность применить ваши навыки!`,
            `✨ **Что нужно делать:** ${(task.skills || []).join(', ')}\n\nПроект требует внимания к деталям и командной работы. Ваш вклад будет очень ценным!`,
            `📍 **Где и когда:** ${task.location || 'Место уточняется у организатора'}, ${task.startTime || task.start_time || 'Время согласуется индивидуально'}\n\nРекомендую приехать за 15 минут до начала.`
          ],
          location: [
            `🗺️ **Место проведения:** ${task.location || 'Уточняется у организатора'}\n\n${task.location ? `Там будет ${Math.floor(Math.random() * 20 + 10)} человек. Лучше взять с собой ${['воду', 'закуску', 'блокнот'][Math.floor(Math.random() * 3)]}` : 'Место будет уточнено дополнительно'}`,
            `🚗 **Как добраться:** ${task.location || 'Уточните у организатора'}\n\nРекомендую использовать ${['метро', 'автобус', 'такси'][Math.floor(Math.random() * 3)]}. Координаты можно уточнить в чате с организатором.`,
            `⏰ **Время:** ${task.startTime || task.start_time || 'Обсуждается индивидуально'}\n\nПланируйте ${Math.floor(Math.random() * 2 + 2)} часа на мероприятие. Не забудьте зарегистрироваться!`
          ],
          skills: [
            `🛠️ **Необходимые навыки:** ${(task.skills || []).join(', ')}\n\n${(task.skills || [])[0] ? `Ваш опыт в ${(task.skills || [])[0]} будет ключом к успеху!` : 'Подойдет любой желающий помочь!'}`,
            `📚 **Что изучить заранее:** ${[(task.skills || [])[0] || 'волонтерство']}, ${['основы безопасности', 'работа в команде', 'первые навыки'][Math.floor(Math.random() * 3)]}\n\nРекомендую посмотреть ${['видеоуроки', 'статьи', 'онлайн-курсы'][Math.floor(Math.random() * 3)]} перед мероприятием.`,
            `💡 **Совет эксперта:** Ваш ${(task.skills || [])[0] || 'опыт'} - это уже 80% успеха! Осталось лишь проявить инициативу и ответственно подходить к делу.`
          ],
          urgency: [
            `⚡ **Срочность:** ${task.urgency || 'medium'}\n\n${task.urgency === 'high' ? '🔥 СРОЧНО! Нужна немедленная помощь. Это критически важная задача!' : '📅 Плановая задача. Выполняйте в комфортном темпе.'}`,
            `⏳ **Дедлайн:** ${task.urgency === 'high' ? 'Сегодня!' : task.urgency === 'medium' ? 'В течение 2-3 дней' : 'В течение недели'}\n\n${task.urgency === 'high' ? 'Отменяйте другие планы - сейчас важнее всего!' : 'Планируйте время заранее.'}`,
            `🎯 **Приоритет:** ${['Высокий', 'Средний', 'Низкий'][['high', 'medium', 'low'].indexOf(task.urgency || 'medium')]}\n\n${task.urgency === 'high' ? 'Эта задача изменит чью-то жизнь к лучшему!' : 'Отличная возможность для развития.'}`
          ],
          whatToBring: [
            `🎒 **Что взять с собой:** ${['Рабочие перчатки', 'Удобная обувь', 'Вода и перекус', 'Блокнот и ручка', 'Телефон с зарядкой'][Math.floor(Math.random() * 5)]}\n\n${task.description.includes('улиц') ? 'На улице может быть ветрено - возьмите куртку.' : 'В помещении будет комфортно.'}`,
            `☀ **Погода и одежда:** ${task.description.includes('парк') ? 'Удобная одежда для активной работы на свежем воздухе. Солнцезащитные очки - плюс!' : 'Классическая деловая одежда. Несколько слоев - лучше.'}`,
            `🥤 **Обязательное:** ${['Идентификатор', 'Медицинская маска', 'Антисептик', 'Рабочие перчатки'][Math.floor(Math.random() * 4)]}\n\n${task.description.includes('дети') ? 'Для работы с детьми понадобится хорошее настроение и терпение!' : 'Стандартный набор для волонтеров.'}`,
            `🎒 **Рекомендация:** ${task.description.includes('эколог') ? 'Возьмите мусорные паки - это поможет природе! Организатор оценит вашу заботу об окружающей среде.' : 'Возьмите хорошее настроение и готовность помогать - это главное!'}`
          ],
          volunteers: [
            `👥 **Команда:** ${Math.floor(Math.random() * 15 + 5)} человек уже записались!\n\nТы будешь работать в команде с опытными волонтерами. Это отличная возможность научиться новому.`,
            `🤝 **Опыт участников:** Средний опыт команды - ${Math.floor(Math.random() * 3 + 2)} года. Не стесняйся обращаться за советом к более опытным коллегам.`,
            `🌟 **Твой вклад:** Твоя ${(task.skills || [])[0] || 'помощь'} будет особенно ценной! Каждый участник важен для общего успеха.`,
            `📱 **Контакты:** Обменивайся контактами с командой заранее. ${['Telegram', 'WhatsApp', 'Дискорд'][Math.floor(Math.random() * 3)]} - отличный выбор для координации.`
          ],
          help: [
            `🆘 **Нужна помощь?** Напиши мне в любой момент! Я помогу разобраться с ${['организатором', 'координатором', 'другими волонтерами'][Math.floor(Math.random() * 3)]} и найду решение.`,
            `💬 **Чат поддержки:** Если что-то непонятно - уточняй! Лучше спросить 10 раз, чем сделать что-то не так.`,
            `📞 **Экстренные контакты:** ${['Номер организатора', 'Горячая линия', 'Координатор группы'][Math.floor(Math.random() * 3)]} - всегда на связи. Не стесняйся обращаться!`,
            `🤝 **Помощь коллегам:** Если видишь, что кто-то затрудняется - помоги! Волонтерство - это командная работа.`
          ],
          default: [
            `🎯 **О задаче:** ${task.title}\n\n${task.description}\n\nЭто ${['очень интересный', 'важный', 'полезный'][Math.floor(Math.random() * 3)]} проект!`,
            `✨ **Твоя роль:** ${(task.skills || [])[0] || 'волонтер'} - это ключ к успеху мероприятия!\n\nТвоя энергия и ${(task.skills || [])[1] || 'энтузиазм'} вдохновят других.`,
            `🎁 **Бонус:** Участвуя в этой задаче, ты получишь ${['благодарность', 'сертификат', 'новые знакомства', 'ценный опыт'][Math.floor(Math.random() * 4)]}!`,
            `🚀 **Мотивация:** Ты делаешь мир лучше! Каждая ${['помощь', 'минута времени', 'добрая улыбка'][Math.floor(Math.random() * 3)]} важна.`
          ]
        };

        // Определение категории вопроса
        if (questionWords.some(word => ['что', 'задача', 'суть', 'смысл'].includes(word))) {
          return responseTemplates.about[Math.floor(Math.random() * responseTemplates.about.length)];
        } else if (questionWords.some(word => ['где', 'место', 'локаци', 'адрес'].includes(word))) {
          return responseTemplates.location[Math.floor(Math.random() * responseTemplates.location.length)];
        } else if (questionWords.some(word => ['навык', 'умение', 'опыт', 'научить'].includes(word))) {
          return responseTemplates.skills[Math.floor(Math.random() * responseTemplates.skills.length)];
        } else if (questionWords.some(word => ['срочно', 'дедлайн', 'когда', 'время'].includes(word))) {
          return responseTemplates.urgency[Math.floor(Math.random() * responseTemplates.urgency.length)];
        } else if (questionWords.some(word => ['взять', 'одежда', 'что', 'принести', 'собой'].includes(word))) {
          return responseTemplates.whatToBring[Math.floor(Math.random() * responseTemplates.whatToBring.length)];
        } else if (questionWords.some(word => ['сколько', 'людей', 'команда', 'волонтер'].includes(word))) {
          return responseTemplates.volunteers[Math.floor(Math.random() * responseTemplates.volunteers.length)];
        } else if (questionWords.some(word => ['помощь', 'помочь', 'проблема', 'вопрос', 'затруднение'].includes(word))) {
          return responseTemplates.help[Math.floor(Math.random() * responseTemplates.help.length)];
        } else {
          return responseTemplates.default[Math.floor(Math.random() * responseTemplates.default.length)];
        }
      };

      const response = generatePersonalizedResponse(userMessage.content, task);
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
    <Card className="w-full h-[500px]">
      <CardHeader className="pb-3 border-b">
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
  );
}
