import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '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',
  dangerouslyAllowBrowser: true // Только для демонстрации, в проде использовать backend
});

export interface TaskData {
  id?: string;
  title?: string;
  description?: string;
  location?: string;
  date?: string;
  volunteers_needed?: number;
  hardSkills?: string[];
  softSkills?: string[];
  urgency?: string;
  category?: string;
  estimatedDuration?: string;
  difficulty?: string;
}

interface AiResponse {
  message: string;
  taskData?: TaskData;
  partialData?: TaskData;
}

const taskSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Краткое название задачи (макс. 100 символов)"
    },
    description: {
      type: "string", 
      description: "Подробное описание задачи и требований"
    },
    location: {
      type: "string",
      description: "Место проведения в Астане"
    },
    date: {
      type: "string",
      description: "Дата проведения в формате ДД.ММ.ГГГГ"
    },
    volunteers_needed: {
      type: "number",
      description: "Количество необходимых волонтеров"
    },
    hardSkills: {
      type: "array",
      items: { type: "string" },
      description: "Массив технических навыков (hard skills)"
    },
    softSkills: {
      type: "array",
      items: { type: "string" },
      description: "Массив мягких навыков (soft skills)"
    }
  },
  required: ["title", "description", "location", "date", "volunteers_needed", "hardSkills", "softSkills"],
  additionalProperties: false
};

function extractPartialData(message: string, previousData: TaskData = {}): TaskData {
  const data: TaskData = { ...previousData };
  
  // ЕСЛИ ментор отвечает на вопрос о названии - принимаем ЛЮБОЕ название
  // Короткие ответы (1-3 слова) считаются названием задачи
  const isShortAnswer = message.trim().length <= 50 && 
                        message.trim().split(' ').length <= 4 &&
                        Object.keys(previousData).length > 0;
  
  if (isShortAnswer && !data.title) {
    data.title = message.trim();
  }
  
  // Умное извлечение даты с естественного языка
  if (!data.date) {
    const extractedDate = extractNaturalDate(message);
    if (extractedDate) {
      data.date = extractedDate;
    }
  }
  
  // Умное извлечение локации с контекстом
  if (!data.location) {
    const extractedLocation = extractNaturalLocation(message);
    if (extractedLocation) {
      data.location = extractedLocation;
    }
  }
  
  // Извлечение количества волонтеров с поддержкой разных форматов
  if (!data.volunteers_needed) {
    // Словарь для преобразования текстовых чисел
    const numberWords: { [key: string]: number } = {
      'один': 1, 'одна': 1, 'одно': 1,
      'два': 2, 'две': 2, 'двое': 2,
      'три': 3, 'трое': 3,
      'четыре': 4,
      'пять': 5,
      'шесть': 6,
      'семь': 7,
      'восемь': 8,
      'девять': 9,
      'десять': 10,
      'одиннадцать': 11,
      'двенадцать': 12,
      'тринадцать': 13,
      'четырнадцать': 14,
      'пятнадцать': 15,
      'шестнадцать': 16,
      'семнадцать': 17,
      'восемнадцать': 18,
      'девятнадцать': 19,
      'двадцать': 20,
      'тридцать': 30,
      'сорок': 40,
      'пятьдесят': 50,
      'шестьдесят': 60,
      'семьдесят': 70,
      'восемьдесят': 80,
      'девяносто': 90,
      'сто': 100
    };

    // Паттерны для разных форматов количества
    const volunteerPatterns = [
      // Новые паттерны - просто числа в контексте задачи
      /(?:нужен|нужно|нужны|требуется|потребуется|приветствуются|ищем|искать)\s+(\d+)/i,
      /(\d+)\s+(?:нужен|нужны|требуется|потребуется|приветствуются)/i,
      /(\d+)\s+(?:людей|человек|участник|помощник)/i,
      /(\d+)\s+(?:волонтер|волонтера|волонтеров)/i,
      
      // Цифровые паттерны с контекстными словами
      /нужн(?:о|а)?\s*(\d+)\s*(?:волонтер|человек|людей)/i,
      /требуется\s*(\d+)\s*(?:волонтер|человек|людей)/i,
      /потребуется\s*(\d+)\s*(?:волонтер|человек|людей)/i,
      /(\d+)\s*(?:человек|волонтер|людей)\s*(?:нужн(?:о|а)?|требуется|потребуется)/i,
      
      // Текстовые паттерны - "четыре волонтера", "нужно два человека"
      /(нужн(?:о|а)?|требуется|потребуется)\s+([а-яё]+)\s+(?:волонтер|человек|людей|участник|помощник)/i,
      /([а-яё]+)\s+(?:волонтер|человек|людей|участник|помощник)/i,
      
      // Особые выражения
      /пар[ау]\s+(?:волонтер|человек|людей|участник)/i,
      /несколько\s+(?:волонтер|человек|людей|участник)/i,
      /много\s+(?:волонтер|человек|людей|участник)/i,
      /групп[ау]\s+(?:волонтер|человек|людей|участник)/i,
      /команд[ау]\s+(?:волонтер|человек|людей|участник)/i,
      
      // Просто числа в конце предложения или после запятой
      /,\s*(\d+)(?:\s*[.!]|$)/,
      /^(\d+)(?:\s*[.!]|$)/,
      /(\d+)(?:\s*$)/
    ];
    
    for (const pattern of volunteerPatterns) {
      const match = message.match(pattern);
      if (match) {
        let number: number | null = null;
        
        // Пробуем извлечь число из разных групп
        for (let i = 1; i < match.length; i++) {
          const matchedText = match[i]?.toLowerCase().trim();
          if (matchedText) {
            // Проверяем цифровое значение
            const digitalMatch = matchedText.match(/\d+/);
            if (digitalMatch) {
              number = parseInt(digitalMatch[0]);
              break;
            }
            
            // Проверяем текстовое значение
            if (numberWords[matchedText]) {
              number = numberWords[matchedText];
              break;
            }
            
            // Особые выражения
            if (matchedText.includes('пар')) {
              number = 2;
              break;
            }
            if (matchedText.includes('несколько')) {
              number = 3; // По умолчанию для "несколько"
              break;
            }
            if (matchedText.includes('много')) {
              number = 10; // По умолчанию для "много"
              break;
            }
            if (matchedText.includes('групп') || matchedText.includes('команд')) {
              number = 5; // По умолчанию для "группа"
              break;
            }
          }
        }
        
        // Дополнительная проверка: если число найдено, проверяем контекст
        if (number && number > 0) {
          // Проверяем, что это не год, не время и не другой параметр
          const messageLower = message.toLowerCase();
          
          // Исключаем годы (1900-2100)
          if (number >= 1900 && number <= 2100) {
            continue; // Пропускаем, это скорее всего год
          }
          
          // Исключаем время (0-23 часов)
          if (number <= 23 && (messageLower.includes('час') || messageLower.includes(':'))) {
            continue; // Пропускаем, это скорее всего время
          }
          
          // Проверяем контекст волонтерской деятельности
          const volunteerContext = [
            'нужен', 'нужно', 'нужны', 'требуется', 'потребуется', 'приветствуются', 
            'ищем', 'искать', 'помощь', 'помощники', 'участники', 'команда', 'группа',
            'волонтер', 'волонтера', 'волонтеров', 'людей', 'человек'
          ];
          
          const hasVolunteerContext = volunteerContext.some(word => 
            messageLower.includes(word)
          );
          
          // Если есть контекст волонтеров или число небольшое (1-50), скорее всего это количество волонтеров
          if (hasVolunteerContext || (number >= 1 && number <= 50)) {
            data.volunteers_needed = number;
            break;
          }
        }
      }
    }
  }
  
  // Описание - берем основную часть сообщения если есть достаточно текста
  if (message.length > 50 && !data.description) {
    data.description = message.substring(0, 500);
  }
  
  return data;
}

// Умное извлечение даты из естественного языка
function extractNaturalDate(message: string): string | null {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  
  // Относительные даты
  const relativePatterns = [
    { pattern: /завтра/i, date: tomorrow },
    { pattern: /послезавтра|после завтра/i, date: dayAfterTomorrow },
    { pattern: /сегодня/i, date: today },
    { pattern: /на днях|скоро/i, date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000) }
  ];
  
  for (const { pattern, date } of relativePatterns) {
    if (pattern.test(message.toLowerCase())) {
      // Ищем время рядом
      const timeMatch = message.match(/(\d{1,2})[:.](\d{2})/);
      if (timeMatch) {
        date.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
      }
      return formatDate(date);
    }
  }
  
  // Конкретные даты в разных форматах
  const datePatterns = [
    /(\d{1,2})[.\/](\d{1,2})[.\/]?(\d{2,4})?/, // ДД.ММ или ДД.ММ.ГГГГ
    /(\d{2,4})[.\/](\d{1,2})[.\/](\d{1,2})/, // ГГГГ.ММ.ДД
    /(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/i,
    /(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+(\d{1,2})/i
  ];
  
  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (match) {
      let day, month, year;
      
      if (pattern === datePatterns[0]) { // ДД.ММ.ГГГГ
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = match[3] ? parseInt(match[3].length === 2 ? '20' + match[3] : match[3]) : today.getFullYear();
      } else if (pattern === datePatterns[1]) { // ГГГГ.ММ.ДД
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      } else { // Месяц словами
        const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        if (pattern === datePatterns[2]) {
          day = parseInt(match[1]);
          month = monthNames.indexOf(match[2].toLowerCase());
          year = today.getFullYear();
        } else {
          day = parseInt(match[2]);
          month = monthNames.indexOf(match[1].toLowerCase());
          year = today.getFullYear();
        }
      }
      
      const date = new Date(year, month, day);
      return formatDate(date);
    }
  }
  
  return null;
}

// Функция для генерации локации на основе контекста задачи
async function generateLocationFromContext(taskTitle: string, description: string = ''): Promise<string | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `На основе названия и описания задачи сгенерируй подходящую локацию в Астане.

          ПРАВИЛА:
          - Выбери реальное место в Астане, которое подходит для задачи
          - Учитывай тип задачи: уборка → парк, помощь детям → школа, спорт → стадион и т.д.
          - Используй конкретные названия: "Центральный парк", "Школа №45", "Дворец мира и согласия"
          - Если задача может проходить в разных местах, выбери наиболее подходящее
          - ВСЕГДА добавляй ", Астана" в конце
          - Если не можешь определить подходящее место, верни null

          ПРИМЕРЫ:
          - "Уборка парка" → "Центральный парк, Астана"
          - "Помощь в школе" → "Школа №45, Астана" 
          - "Спортивное мероприятие" → "Стадион 'Астана Арена', Астана"
          - "Экологическая акция" → "Парк первого президента, Астана"
          - "Помощь животным" → "Приют для животных, Астана"

          Верни ТОЛЬКО название локации или null, без пояснений.`
        },
        {
          role: "user",
          content: `Название задачи: ${taskTitle}
Описание: ${description || 'Нет описания'}

Генерируй подходящую локацию в Астане:`
        }
      ],
      temperature: 0.5,
      max_tokens: 100
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (!response || response.toLowerCase().includes('null') || response.toLowerCase().includes('не могу')) {
      return null;
    }
    
    // Проверяем, что локация в Астане
    if (!response.toLowerCase().includes('астана')) {
      return `${response}, Астана`;
    }
    
    return response;
  } catch (error) {
    console.error('Error generating location:', error);
    return null;
  }
}

// Умное извлечение локации из контекста
function extractNaturalLocation(message: string): string | null {
  // Сначала проверяем, не является ли сообщение коротким ответом с названием места
  const trimmedMessage = message.trim();
  
  // Если это короткий ответ (1-5 слов), считаем его названием места
  if (trimmedMessage.length <= 50 && 
      trimmedMessage.split(' ').length <= 5 &&
      !trimmedMessage.includes('нужен') && 
      !trimmedMessage.includes('требуется') &&
      !trimmedMessage.includes('волонтер') &&
      !trimmedMessage.includes('человек') &&
      !trimmedMessage.includes('помощь')) {
    
    // Если уже есть "Астана" в ответе, возвращаем как есть
    if (trimmedMessage.toLowerCase().includes('астана')) {
      return trimmedMessage;
    }
    
    // Иначе добавляем ", Астана"
    return `${trimmedMessage}, Астана`;
  }
  
  // Для длинных сообщений используем старую логику
  const locationTypes = {
    'парк': ['парк', 'сквер', 'сад', 'зеленая зона'],
    'школа': ['школа', 'гимназия', 'лицей', 'учебное заведение'],
    'больница': ['больница', 'поликлиника', 'медцентр', 'клиника'],
    'университет': ['университет', 'институт', 'колледж'],
    'центр': ['центр', 'дворец', 'дом культуры', 'клуб'],
    'стадион': ['стадион', 'спорткомплекс', 'арена'],
    'торговый центр': ['торговый центр', 'тц', 'молл', 'магазин'],
    'улица': ['улица', 'проспект', 'площадь', 'бульвар'],
    'приют': ['приют', 'центр помощи', 'фонд']
  };
  
  // Ищем тип локации в сообщении
  for (const [type, keywords] of Object.entries(locationTypes)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`(.{0,50}?${keyword}.{0,30}?)`, 'i');
      const match = message.match(regex);
      if (match) {
        let location = match[1].trim();
        
        // Если локация слишком короткая, добавляем контекст
        if (location.length < 10) {
          location = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`;
        }
        
        // Добавляем Астану если не указано
        if (!location.toLowerCase().includes('астана')) {
          location += ', Астана';
        }
        
        return location;
      }
    }
  }
  
  // Ищем упоминания конкретных мест в Астане
  const astanaPlaces = [
    'парк первого президента', 'центральный парк', 'парк "жастар"', 
    'дворец школьников', 'дворец мира', 'дворец независимости',
    'стадион "астана арена"', 'хан шатыр', 'байконур',
    'центральная площадь', 'площадь республики',
    'национальный музей', 'опера и балет'
  ];
  
  for (const place of astanaPlaces) {
    if (message.toLowerCase().includes(place)) {
      return `${place.charAt(0).toUpperCase() + place.slice(1)}, Астана`;
    }
  }
  
  return null;
}

// Форматирование даты в ДД.ММ.ГГГГ
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function isDataComplete(data: TaskData): boolean {
  // Теперь считаем данные полными, если есть только основные поля:
  // название, дата, количество волонтеров
  // Локация, описание и навыки AI сгенерирует сам
  return !!(
    data.title &&
    data.date &&
    data.volunteers_needed
  );
}

// Новая функция - проверяем есть ли все данные КРОМЕ названия
function hasBasicDataExceptTitle(data: TaskData): boolean {
  return !!(
    data.date &&
    data.volunteers_needed
  );
}

function getMissingFields(data: TaskData): string[] {
  const missing: string[] = [];
  
  if (!data.title) missing.push('название задачи');
  // Локация, описание и навыки не считаем отсутствующими - AI сгенерирует их сам
  if (!data.date) missing.push('дата проведения');
  if (!data.volunteers_needed) missing.push('количество волонтеров');
  
  return missing;
}

function generateClarifyingQuestion(missingFields: string[], data: TaskData): string {
  const questions = {
    'название задачи': 'Как бы вы назвали эту задачу кратко и понятно? (например: "Уборка парка", "Помощь в школе", "Экологическая акция")',
    'дата проведения': 'На какую дату запланировано мероприятие?',
    'количество волонтеров': 'Сколько волонтеров потребуется для помощи? (можно ответить: "5", "пять", "пару", "несколько" и т.д.)'
  };
  
  // ПРОВЕРКА: если нет названия ИЛИ если есть все остальные данные - спрашиваем название
  if (!data.title || hasBasicDataExceptTitle(data)) {
    return questions['название задачи'];
  }
  
  // Затем спрашиваем остальные поля по приоритету
  for (const field of ['дата проведения', 'количество волонтеров']) {
    if (missingFields.includes(field)) {
      return questions[field as keyof typeof questions] || `Расскажите подробнее про ${field}.`;
    }
  }
  
  return 'Отлично! Теперь я сгенерирую описание, подберу оптимальные навыки и предложу подходящую локацию для этой задачи.';
}

export async function processAiMessage(message: string, history: any[] = []): Promise<AiResponse> {
  // Извлекаем данные из предыдущих сообщений
  let accumulatedData: TaskData = {};
  
  // Собираем все данные из истории сообщений
  history.forEach(msg => {
    if (msg.role === 'user') {
      const msgData = extractPartialData(msg.content, accumulatedData);
      accumulatedData = { ...accumulatedData, ...msgData };
    }
  });
  
  // Извлекаем данные из текущего сообщения
  const currentData = extractPartialData(message, accumulatedData);
  const combinedData = { ...accumulatedData, ...currentData };

  try {
    // Если это первое сообщение, делаем умный анализ
    if (history.length === 0) {
      return await analyzeFirstMessage(message, combinedData);
    }
    
    // Проверяем, достаточно ли данных
    if (isDataComplete(combinedData)) {
      // Основные данные есть, генерируем описание и навыки
      try {
        const generatedData = await generateDescriptionAndSkills(combinedData);
        const finalData = { ...combinedData, ...generatedData };
        
        return {
          message: "Отлично! Я подготовил описание, подобрал навыки и предложил локацию на основе вашей информации. Задача готова к созданию!",
          taskData: finalData,
          partialData: finalData
        };
      } catch (error) {
        console.error('Error generating description and skills:', error);
        // Если генерация не удалась, используем fallback
        const fallbackData = generateFallbackData(combinedData.title || '');
        const finalData = { ...combinedData, ...fallbackData };
        
        return {
          message: "Отлично! У меня есть вся информация. Я подготовил описание, навыки и подобрал локацию для задачи.",
          taskData: finalData,
          partialData: finalData
        };
      }
    } else {
      // Данных недостаточно, проверяем что не хватает
      const missing = getMissingFields(combinedData);
      const question = generateClarifyingQuestion(missing, combinedData);
      
      return {
        message: question,
        taskData: undefined,
        partialData: combinedData
      };
    }
    
  } catch (error) {
    console.error('AI Interview Error:', error);
    
    // Детальная информация об ошибке
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error Details:', {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type
      });
      
      // Если проблема с API (включая quota), используем fallback логику
      if (error.status === 429 || error.status === 401 || error.status === 403) {
        console.log('Using fallback logic due to API limitations');
        
        // Если есть достаточно данных, генерируем fallback
        if (isDataComplete(combinedData)) {
          const fallbackData = generateFallbackData(combinedData.title || '');
          const finalData = { ...combinedData, ...fallbackData };
          
          return {
            message: "Отлично! Я подготовил описание, навыки и локацию для задачи. Задача готова к созданию!",
            taskData: finalData,
            partialData: finalData
          };
        } else {
          // Если данных недостаточно, используем простые вопросы
          const missing = getMissingFields(combinedData);
          const question = generateClarifyingQuestion(missing, combinedData);
          
          return {
            message: `Извините, AI сервис временно недоступен. ${question}`,
            taskData: undefined,
            partialData: combinedData
          };
        }
      }
      
      // Для других ошибок API также используем fallback
      const missing = getMissingFields(combinedData);
      const question = generateClarifyingQuestion(missing, combinedData);
      
      return {
        message: `Извините, произошла ошибка с AI сервисом. ${question}`,
        taskData: undefined,
        partialData: combinedData
      };
    }
    
    if (error instanceof Error) {
      console.error('General Error:', error.message, error.stack);
    } else {
      console.error('Unknown error type:', error);
    }
    
    // Для любых других ошибок также используем fallback
    const missing = getMissingFields(combinedData);
    const question = generateClarifyingQuestion(missing, combinedData);
    
    return {
      message: `Произошла ошибка. ${question}`,
      taskData: undefined,
      partialData: combinedData
    };
  }
}

// Функция для генерации описания, навыков и локации на основе всех данных
async function generateDescriptionAndSkills(data: TaskData): Promise<TaskData> {
  try {
    // Проверяем есть ли базовые данные для генерации
    if (!data.title && !data.location && !data.volunteers_needed) {
      console.warn('Insufficient data for generation');
      return {};
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `На основе названия задачи, локации события и других данных сгенерируй описание, раздели навыки на hard и soft skills и при необходимости предложи локацию.
          
          Правила:
          - Описание: развернутое, включает что конкретно делать волонтерам, учитывает локацию события
          - Hard Skills: технические навыки, конкретные умения (программирование, работа с инструментами, иностранные языки)
          - Soft Skills: мягкие навыки, личностные качества (коммуникация, лидерство, ответственность, работа в команде)
          - Используй контекст: название, локация события, количество волонтеров
          - Если данных мало, генерируй на основе названия и локации
          - Учитывай тип локации: парк → экология, школа → работа с детьми, стадион → спорт и т.д.
          - Если локация не указана, предложи подходящую локацию в Астане на контекста задачи
          
          Верни JSON с полями description, hardSkills, softSkills и (опционально) location.`
        },
        {
          role: "user",
          content: `Название: ${data.title || 'Не указано'}
Локация: ${data.location || 'Не указана'}
Дата: ${data.date || 'Не указана'}
Волонтеры: ${data.volunteers_needed || 'Не указано'}`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "generate_description_skills_location",
          strict: false,
          schema: {
            type: "object",
            properties: {
              description: { 
                type: "string",
                description: "Подробное описание задачи с конкретными действиями волонтеров"
              },
              hardSkills: {
                type: "array",
                items: { 
                  type: "string",
                  description: "Технические навыки для выполнения задачи"
                },
                minItems: 1,
                maxItems: 5
              },
              softSkills: {
                type: "array",
                items: { 
                  type: "string",
                  description: "Мягкие навыки для выполнения задачи"
                },
                minItems: 1,
                maxItems: 5
              },
              location: {
                type: "string",
                description: "Предложенная локация в Астане (только если не указана)"
              }
            },
            required: ["description", "hardSkills", "softSkills"],
            additionalProperties: false
          }
        }
      },
      temperature: 0.5,
      max_tokens: 500
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      console.warn('No response from AI');
      return {};
    }

    let generatedData;
    try {
      generatedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Raw response:', responseText);
      return {};
    }

    // Валидация данных
    if (!generatedData.description || !generatedData.hardSkills || !generatedData.softSkills || 
        !Array.isArray(generatedData.hardSkills) || !Array.isArray(generatedData.softSkills)) {
      console.warn('Invalid data structure:', generatedData);
      return {};
    }

    const result: TaskData = {
      description: generatedData.description,
      hardSkills: generatedData.hardSkills.filter(skill => typeof skill === 'string' && skill.trim().length > 0),
      softSkills: generatedData.softSkills.filter(skill => typeof skill === 'string' && skill.trim().length > 0)
    };

    // Добавляем сгенерированную локацию, если ее не было и AI предложил
    if (!data.location && generatedData.location && generatedData.location.trim()) {
      result.location = generatedData.location.trim();
    }

    return result;

  } catch (error) {
    console.error('Generation error:', error);
    
    // Более детальная информация об ошибке
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error Details:', {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type
      });
    } else if (error instanceof Error) {
      console.error('General Error:', error.message, error.stack);
    } else {
      console.error('Unknown error type:', error);
    }
    
    // Fallback - базовая генерация на основе названия
    if (data.title) {
      console.log('Using fallback generation for:', data.title);
      const fallbackData = generateFallbackData(data.title);
      
      // Если локации нет, попробуем сгенерировать
      if (!data.location) {
        const generatedLocation = await generateLocationFromContext(data.title);
        if (generatedLocation) {
          fallbackData.location = generatedLocation;
        }
      }
      
      return fallbackData;
    }
    
    console.log('No title available for fallback, returning empty object');
    return {};
  }
}

// Fallback функция для базовой генерации
function generateFallbackData(title: string): TaskData {
  const titleLower = title.toLowerCase();
  
  let description = `Задача: ${title}. Волонтеры будут помогать в организации и проведении мероприятия.`;
  let hardSkills: string[] = ['Организация'];
  let softSkills: string[] = ['Коммуникация'];
  let location: string | undefined;
  
  // Базовая логика на основе ключевых слов
  if (titleLower.includes('уборк') || titleLower.includes('чист')) {
    description = `Уборка территории. Волонтеры будут заниматься сбором и упаковкой мусора, поддержанием чистоты и порядка.`;
    hardSkills = ['Экология', 'Работа с инструментами'];
    softSkills = ['Ответственность', 'Командная работа'];
    location = 'Центральный парк, Астана';
  } else if (titleLower.includes('животн') || titleLower.includes('приют')) {
    description = `Помощь животным. Волонтеры будут ухаживать за животными, кормить их, гулять, чистить вольеры.`;
    hardSkills = ['Уход за животными', 'Ветеринария'];
    softSkills = ['Забота', 'Терпение', 'Ответственность'];
    location = 'Приют для животных, Астана';
  } else if (titleLower.includes('дет') || titleLower.includes('школ')) {
    description = `Работа с детьми. Волонтеры будут помогать в организации мероприятий, обучении, уходе за детьми.`;
    hardSkills = ['Обучение', 'Педагогика'];
    softSkills = ['Терпение', 'Работа с детьми', 'Эмпатия'];
    location = 'Школа №45, Астана';
  } else if (titleLower.includes('спорт') || titleLower.includes('футбол')) {
    description = `Спортивное мероприятие. Волонтеры будут помогать в организации соревнований, обеспечении порядка, помощи участникам.`;
    hardSkills = ['Спорт', 'Организация мероприятий'];
    softSkills = ['Лидерство', 'Коммуникация'];
    location = 'Стадион "Астана Арена", Астана';
  } else if (titleLower.includes('эколог') || titleLower.includes('парк')) {
    description = `Экологическая акция. Волонтеры будут заниматься посадкой растений, уходом за зелеными зонами, экологическим просвещением.`;
    hardSkills = ['Садоводство', 'Экология'];
    softSkills = ['Экологическое сознание', 'Работа в команде'];
    location = 'Парк первого президента, Астана';
  } else if (titleLower.includes('помощь') || titleLower.includes('помогать')) {
    description = `Социальная помощь. Волонтеры будут оказывать помощь нуждающимся, поддерживать порядок и организацию.`;
    hardSkills = ['Социальная работа'];
    softSkills = ['Эмпатия', 'Коммуникация'];
    location = 'Центр социальной помощи, Астана';
  }
  
  return {
    description,
    hardSkills,
    softSkills,
    location
  };
}

async function analyzeFirstMessage(message: string, extractedData: TaskData): Promise<AiResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Ты — умный AI-ассистент для создания волонтерских задач в Астане. 

          Проанализируй первое сообщение пользователя и:
          1. Извлеки конкретные данные (дата, количество волонтеров)
          2. Если название не указано четко - ОБЯЗАТЕЛЬНО спроси его
          3. НЕ спрашивай про локацию - ты сгенерируешь ее сам на основе контекста
          4. НЕ спрашивай про описание и навыки - ты сгенерируешь их сам с помощью AI
          5. Задай только ОДИН самый важный вопрос

          ПРАВИЛА:
          - Название: ВСЕГДА уточняй, если не указано четко
          - Локация: НЕ спрашивай, сгенерируешь автоматически
          - Количество волонтеров: ИЗВЛЕКАЙ ЛЮБЫЕ ЧИСЛА 1-50, даже без слова "волонтер"
          - Описание: НЕ спрашивай, сгенерируешь сам
          - Навыки: НЕ спрашивай, подберешь автоматически (hard и soft skills)
          - Будь кратким и дружелюбным

          ПРИМЕРЫ:
          Сообщение: "Нужны 8 волонтеров для очистки парка от мусора"
          → Вопрос: "Как бы вы назвали эту задачу? Например: 'Очистка парка'"

          Сообщение: "Помощь в школе завтра, нужно 5"
          → Вопрос: "Как бы вы назвали эту задачу? Например: 'Помощь в школе'"

          Сообщение: "Субботник 15.04, 5 человек"
          → Вопрос: "Как бы вы назвали эту задачу? Например: 'Субботник'"

          Сообщение: "Ищем 10 помощников для мероприятия"
          → Вопрос: "Как бы вы назвали эту задачу? Например: 'Поиск помощников'"`
        },
        {
          role: "user",
          content: `Проанализируй это сообщение и задай умный вопрос: "${message}"`
        }
      ],
      temperature: 0.7
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Расскажите подробнее о задаче.';
    
    // Извлекаем и генерируем данные с помощью AI
    const dataCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Проанализируй сообщение пользователя и извлеки конкретные данные:
          - Дата (если есть)
          - Количество волонтеров (если есть, поддерживай форматы: "5", "пять", "двое", "пару", "несколько")
          
          ВАЖНО:
          - Для количества волонтеров: ИЗВЛЕКАЙ ЛЮБЫЕ ЧИСЛА 1-50 в контексте задачи, даже без слова "волонтер"
          - Примеры: "нужно 5" → 5, "3 человека" → 3, "ищем 10" → 10, "приветствуются 15" → 15
          - НЕ извлекай локацию - AI сгенерирует ее автоматически
          - НЕ генерируй название, описание и навыки - только извлеки то что явно указано
          - Если данных нет, верни пустые поля`
        },
        {
          role: "user",
          content: `Сообщение: "${message}"`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "extract_basic_data",
          strict: false,
          schema: {
            type: "object",
            properties: {
              location: { type: "string" },
              date: { type: "string" },
              volunteers_needed: { type: "number" }
            },
            additionalProperties: false
          }
        }
      },
      temperature: 0.5
    });

    let aiExtractedData: TaskData = {};
    try {
      const parsed = JSON.parse(dataCompletion.choices[0]?.message?.content || '{}');
      aiExtractedData = parsed;
    } catch (e) {
      // Если JSON не распарсился, используем наши паттерны
      aiExtractedData = extractedData;
    }

    // Комбинируем данные
    const combinedData = { ...extractedData, ...aiExtractedData };

    return {
      message: aiResponse,
      taskData: undefined,
      partialData: combinedData
    };

  } catch (error) {
    console.error('First message analysis error:', error);
    
    // Если проблема с API (включая quota), используем fallback логику
    if (error instanceof OpenAI.APIError && (error.status === 429 || error.status === 401 || error.status === 403)) {
      console.log('Using fallback logic for first message due to API limitations');
      
      // Используем простую логику на основе паттернов
      const missing = getMissingFields(extractedData);
      
      if (missing.includes('название задачи') || !extractedData.title) {
        return {
          message: 'Как бы вы назвали эту задачу кратко и понятно? (например: "Уборка парка", "Помощь в школе", "Экологическая акция")',
          taskData: undefined,
          partialData: extractedData
        };
      }
      
      if (missing.includes('дата проведения')) {
        return {
          message: 'На какую дату запланировано мероприятие?',
          taskData: undefined,
          partialData: extractedData
        };
      }
      
      if (missing.includes('количество волонтеров')) {
        return {
          message: 'Сколько волонтеров потребуется для помощи? (можно ответить: "5", "пять", "пару", "несколько" и т.д.)',
          taskData: undefined,
          partialData: extractedData
        };
      }
    }
    
    // Fallback на простую логику
    const missing = getMissingFields(extractedData);
    const question = generateClarifyingQuestion(missing, extractedData);
    
    return {
      message: question,
      taskData: undefined,
      partialData: extractedData
    };
  }
}

// Mock функция для публикации задач (в реальном проекте здесь будет API call)
export async function publishTask(taskData: TaskData): Promise<{ success: boolean; task?: any; message: string }> {
  try {
    // Имитация API вызова
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock данные задачи
    const mockTask = {
      id: Date.now().toString(),
      ...taskData,
      status: 'active',
      created_at: new Date().toISOString(),
      creator_id: 'org-1'
    };
    
    return {
      success: true,
      task: mockTask,
      message: 'Задача успешно опубликована!'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Ошибка при публикации задачи'
    };
  }
}
