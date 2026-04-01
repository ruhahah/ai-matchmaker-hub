// Скрипт для добавления демо-данных для видео презентации
import { demoDatabase } from './demoDatabase';
import { friendsService } from './friendsService';
import { responsesDatabase } from './responsesService';

export function initializeVideoDemoData() {
  console.log('🎬 Инициализация демо-данных для видео...');
  
  // 1. Добавляем новые задачи для демонстрации
  const newTasks = [
    {
      title: 'Техническая помощь в школе',
      description: 'Настройка компьютеров в компьютерном классе, установка ПО, помощь учителям с техническими вопросами',
      skills: ['IT', 'Программирование', 'Обучение'],
      location: 'Школа №45, Астана',
      urgency: 'medium',
      creatorId: 'org-1',
      requiredVolunteers: 5,
      startTime: '15:00',
      date: '15.04.2026'
    },
    {
      title: 'Фотосессия для приюта',
      description: 'Профессиональная фотография животных для сайта приюта, помощь в создании портфолио питомцев',
      skills: ['Фотография', 'Животные', 'Творчество'],
      location: 'Приют "Дружба", Астана',
      urgency: 'low',
      creatorId: 'org-2',
      requiredVolunteers: 3,
      startTime: '12:00',
      date: '20.04.2026'
    },
    {
      title: 'Перевод для иностранных гостей',
      description: 'Помощь с переводом для международной конференции, встрече гостей, экскурсии по городу',
      skills: ['Языки', 'Коммуникация', 'Организация'],
      location: 'Дворец мира и согласия, Астана',
      urgency: 'high',
      creatorId: 'org-3',
      requiredVolunteers: 8,
      startTime: '09:00',
      date: '18.04.2026'
    },
    {
      title: 'Ремонт детской площадки',
      description: 'Покраска игрового оборудования, ремонт качелей, установка новых элементов безопасности',
      skills: ['Ремонт', 'Дети', 'Строительство'],
      location: 'Парк "Жастар", Астана',
      urgency: 'medium',
      creatorId: 'org-1',
      requiredVolunteers: 10,
      startTime: '10:00',
      date: '22.04.2026'
    },
    {
      title: 'Кулинарный мастер-класс',
      description: 'Помощь в проведении кулинарного мастер-класса для детей, подготовка ингредиентов, уборка',
      skills: ['Кулинария', 'Дети', 'Организация'],
      location: 'Кулинарная студия, Астана',
      urgency: 'low',
      creatorId: 'org-2',
      requiredVolunteers: 4,
      startTime: '14:00',
      date: '25.04.2026'
    }
  ];

  // Добавляем задачи в базу данных
  newTasks.forEach(taskData => {
    const task = demoDatabase.createTask(taskData);
    console.log(`✅ Создана задача: "${task.title}"`);
    
    // Создаем уведомления для подходящих волонтеров
    responsesDatabase.createNewTaskNotifications(task.id, task.title, task.skills);
  });

  // 2. Добавляем текущего пользователя (создаем профиль для демонстрации)
  const currentUser = {
    id: 'current-user',
    name: 'Ашим Жумабай',
    email: 'ashim@example.com',
    role: 'volunteer' as const,
    bio: 'Full-stack разработчик, увлекаюсь волонтерством и помогаю организовывать IT-мероприятия',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ashim',
    location: 'Астана',
    skills: ['Программирование', 'IT', 'Обучение', 'Фотография', 'Коммуникация'],
    friends: [],
    friendRequests: { sent: [], received: [] },
    stats: { tasksCompleted: 6, hoursVolunteered: 24, rating: 4.8 },
    invitations: []
  };

  // Добавляем текущего пользователя в профили
  const data = demoDatabase.getDataForDemo();
  data.profiles.push(currentUser);
  demoDatabase.saveDataForDemo(data);
  console.log(`✅ Добавлен текущий пользователь: ${currentUser.name}`);

  // 3. Создаем отклики от текущего пользователя на несколько задач
  const tasksToApply = ['task-1', 'task-2', 'task-3']; // Существующие задачи
  
  tasksToApply.forEach(taskId => {
    const response = responsesDatabase.createResponse({
      taskId,
      volunteerId: currentUser.id,
      volunteerName: currentUser.name,
      volunteerEmail: currentUser.email,
      volunteerAvatar: currentUser.avatar,
      status: 'pending',
      message: generateApplicationMessage(taskId, currentUser.skills),
      matchingScore: 0.85 + Math.random() * 0.15,
      hardSkills: currentUser.skills.slice(0, 2),
      softSkills: currentUser.skills.slice(2),
      experience: 'Активно участвую в волонтерских проектах последние 2 года',
      availability: 'flexible',
      motivation: 'Хочу применять свои навыки для помощи обществу'
    });
    
    console.log(`✅ Создан отклик на задачу: ${taskId}`);
  });

  // 4. Добавляем друзей и запросы в дружбу
  friendsService.initializeDemoData();
  
  // Отправляем запросы в дружбу от других пользователей
  const friendRequests = [
    { fromUserId: 'vol-1', toUserId: currentUser.id },
    { fromUserId: 'vol-2', toUserId: currentUser.id },
    { fromUserId: 'vol-3', toUserId: currentUser.id }
  ];

  friendRequests.forEach(request => {
    try {
      const friendRequest = friendsService.sendFriendRequest(request.fromUserId, request.toUserId);
      console.log(`✅ Отправлен запрос в дружбу от ${friendRequest.fromUserName}`);
    } catch (error) {
      console.log(`Ошибка при отправке запроса в дружбу:`, error);
    }
  });

  // 5. Создаем командные приглашения на задачи
  const teamInvitations = [
    {
      fromUserId: 'vol-1',
      toUserId: currentUser.id,
      taskId: 'task-1',
      taskTitle: 'Экологическая акция в парке',
      message: 'Привет! Хочешь присоединиться к нашей команде для уборки парка? Твои навыки очень пригодятся!'
    },
    {
      fromUserId: 'vol-4',
      toUserId: currentUser.id,
      taskId: 'task-5',
      taskTitle: 'Спортивный турнир по футболу',
      message: 'Нужен еще один человек для организации турнира. Если любишь спорт - присоединяйся!'
    }
  ];

  teamInvitations.forEach(invitation => {
    try {
      const teamInv = friendsService.sendTeamInvitation(
        invitation.fromUserId,
        invitation.toUserId,
        invitation.taskId,
        invitation.taskTitle,
        invitation.message
      );
      console.log(`✅ Отправлено командное приглашение от ${teamInv.fromUserName}`);
    } catch (error) {
      console.log(`Ошибка при отправке командного приглашения:`, error);
    }
  });

  // 6. Принимаем один из запросов в дружбу для демонстрации
  const requests = friendsService.getFriendRequests(currentUser.id);
  if (requests.length > 0) {
    friendsService.acceptFriendRequest(requests[0].id);
    console.log(`✅ Принят запрос в дружбу от ${requests[0].fromUserName}`);
  }

  console.log('🎉 Демо-данные для видео успешно инициализированы!');
  console.log('\n📋 Что добавлено:');
  console.log('- 5 новых задач для демонстрации');
  console.log('- Профиль текущего пользователя');
  console.log('- 3 отклика на задачи');
  console.log('- 3 запроса в дружбу');
  console.log('- 2 командных приглашения');
  console.log('- 1 принятая дружба');
}

function generateApplicationMessage(taskId: string, skills: string[]): string {
  const messages = {
    'task-1': `Здравствуйте! Я с удовольствием поучаствую в экологической акции. Мои навыки в ${skills.join(', ')} очень пригодятся для организации мероприятия.`,
    'task-2': `Добрый день! У меня есть опыт работы с животными и я бы хотел помочь в приюте. Свободен в выходные дни.`,
    'task-3': `Привет! Я люблю работать с детьми и умею организовывать мероприятия. Буду рад помочь на фестивале!`
  };
  
  return messages[taskId as keyof typeof messages] || 'Здравствуйте! Я хотел бы принять участие в этой задаче.';
}

// Функция для сброса демо-данных
export function resetVideoDemoData() {
  console.log('🔄 Сброс демо-данных...');
  demoDatabase.resetDemoData();
  localStorage.removeItem('friendRequests');
  localStorage.removeItem('teamInvitations');
  console.log('✅ Демо-данные сброшены');
}

// Автоматически инициализируем при импорте в development режиме
if (import.meta.env.DEV) {
  // Проверяем, есть ли уже демо-данные
  const existingData = demoDatabase.getDataForDemo();
  if (!existingData.profiles.find((p: any) => p.id === 'current-user')) {
    initializeVideoDemoData();
  }
}
