import { Response, ResponseStats, ResponseFilters, ResponseNotification } from '@/types/responses';
import { demoDatabase, type DemoProfile } from '@/lib/demoDatabase';

// Mock база данных откликов с сохранением в localStorage
class ResponsesDatabase {
  private STORAGE_KEY = 'volunteer_responses';
  private NOTIFICATIONS_KEY = 'volunteer_notifications';

  private getStoredResponses(): Response[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      // Convert date strings back to Date objects
      return parsed.map((r: any) => ({
        ...r,
        appliedAt: new Date(r.appliedAt),
        reviewedAt: r.reviewedAt ? new Date(r.reviewedAt) : undefined
      }));
    } catch {
      return [];
    }
  }

  private saveResponses(responses: Response[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(responses));
  }

  private getStoredNotifications(): ResponseNotification[] {
    try {
      const data = localStorage.getItem(this.NOTIFICATIONS_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      // Convert date strings back to Date objects
      return parsed.map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt)
      }));
    } catch {
      return [];
    }
  }

  private saveNotifications(notifications: ResponseNotification[]): void {
    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }

  constructor() {
    // Initialize with mock data if localStorage is empty
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.initializeMockData();
    }
  }

  private initializeMockData() {
    // Создаем моковые отклики для демонстрации
    const mockResponses: Response[] = [
      {
        id: 'resp-1',
        taskId: 'task-1',
        volunteerId: 'vol-1',
        volunteerName: 'Айгуль Нурмаханова',
        volunteerEmail: 'aigul@example.com',
        volunteerAvatar: '/avatars/aigul.jpg',
        status: 'pending',
        message: 'Здравствуйте! Я с удовольствием поучаствую в уборке парка. У меня есть опыт в организации экологических акций.',
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 дня назад
        matchingScore: 0.85,
        hardSkills: ['Экология', 'Организация мероприятий'],
        softSkills: ['Ответственность', 'Коммуникация'],
        experience: 'Участвовала в 5 экологических акциях за последний год',
        availability: 'flexible',
        motivation: 'Хочу внести вклад в благоустройство города'
      },
      {
        id: 'resp-2',
        taskId: 'task-1',
        volunteerId: 'vol-2',
        volunteerName: 'Дмитрий Петров',
        volunteerEmail: 'dmitry@example.com',
        volunteerAvatar: '/avatars/dmitry.jpg',
        status: 'accepted',
        message: 'Опыт работы в команде более 3 лет. Готов помочь в любое время.',
        appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 дня назад
        reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 день назад
        reviewedBy: 'org-1',
        reviewMessage: 'Отличный кандидат! Приглашаем к участию.',
        matchingScore: 0.92,
        hardSkills: ['Работа в команде', 'Логистика'],
        softSkills: ['Лидерство', 'Ответственность'],
        experience: '3 года в волонтерских проектах',
        availability: 'immediate',
        motivation: 'Люблю помогать людям и улучшать окружающую среду'
      }
    ];

    this.saveResponses(mockResponses);

    // Создаем моковые уведомления
    const mockNotifications: ResponseNotification[] = [
      {
        id: 'notif-1',
        type: 'new_response',
        taskId: 'task-1',
        taskTitle: 'Уборка центрального парка',
        volunteerId: 'vol-1',
        volunteerName: 'Айгуль Нурмаханова',
        organizerId: 'org-1',
        recipientId: 'org-1',
        recipientRole: 'organizer',
        message: 'Новый отклик на задачу "Уборка центрального парка"',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: false,
        priority: 'medium',
        actionUrl: '/tasks/task-1'
      }
    ];

    this.saveNotifications(mockNotifications);
  }

  // Создать уведомление для организатора (public)
  public createOrganizerNotification(data: {
    type: ResponseNotification['type'];
    taskId: string;
    taskTitle: string;
    volunteerId?: string;
    volunteerName?: string;
    message: string;
    priority?: ResponseNotification['priority'];
  }) {
    const notification: ResponseNotification = {
      id: `notif-org-${Date.now()}`,
      type: data.type,
      taskId: data.taskId,
      taskTitle: data.taskTitle,
      volunteerId: data.volunteerId,
      volunteerName: data.volunteerName,
      organizerId: 'org-1',
      recipientId: 'org-1',
      recipientRole: 'organizer',
      message: data.message,
      createdAt: new Date(),
      read: false,
      priority: data.priority || 'medium',
      actionUrl: `/tasks/${data.taskId}`
    };

    const notifications = this.getStoredNotifications();
    notifications.push(notification);
    this.saveNotifications(notifications);
  }

  // Создать уведомление для волонтера (public)
  public createVolunteerNotification(data: {
    type: ResponseNotification['type'];
    taskId: string;
    taskTitle: string;
    volunteerId: string;
    volunteerName: string;
    message: string;
    priority?: ResponseNotification['priority'];
  }) {
    const notification: ResponseNotification = {
      id: `notif-vol-${Date.now()}`,
      type: data.type,
      taskId: data.taskId,
      taskTitle: data.taskTitle,
      volunteerId: data.volunteerId,
      volunteerName: data.volunteerName,
      recipientId: data.volunteerId,
      recipientRole: 'volunteer',
      message: data.message,
      createdAt: new Date(),
      read: false,
      priority: data.priority || 'medium',
      actionUrl: `/tasks/${data.taskId}`
    };

    const notifications = this.getStoredNotifications();
    notifications.push(notification);
    this.saveNotifications(notifications);
  }

  // Получить все отклики (public)
  getAllResponses(): Response[] {
    return this.getStoredResponses();
  }

  // Получить отклики волонтера (public)
  getVolunteerResponses(volunteerId: string): Response[] {
    return this.getStoredResponses().filter(response => response.volunteerId === volunteerId);
  }

  // Получить все отклики для задачи
  getTaskResponses(taskId: string): Response[] {
    return this.getStoredResponses().filter(response => response.taskId === taskId);
  }

  // Получить отклик по ID
  getResponseById(responseId: string): Response | undefined {
    return this.getStoredResponses().find(response => response.id === responseId);
  }

  // Создать новый отклик
  createResponse(responseData: Omit<Response, 'id' | 'appliedAt'>): Response {
    const responses = this.getStoredResponses();
    
    const newResponse: Response = {
      ...responseData,
      id: `resp-${Date.now()}`,
      appliedAt: new Date()
    };

    responses.push(newResponse);
    this.saveResponses(responses);

    // Создаем уведомление для организатора
    this.createOrganizerNotification({
      type: 'new_response',
      taskId: responseData.taskId,
      taskTitle: 'Новая задача', // В реальном приложении здесь будет название задачи
      volunteerId: responseData.volunteerId,
      volunteerName: responseData.volunteerName,
      message: `Новый отклик от ${responseData.volunteerName}`
    });

    return newResponse;
  }

  // Обновить статус отклика
  updateResponseStatus(responseId: string, status: Response['status'], reviewMessage?: string, organizerId?: string): Response | null {
    const responses = this.getStoredResponses();
    const responseIndex = responses.findIndex(response => response.id === responseId);
    if (responseIndex === -1) return null;

    const oldStatus = responses[responseIndex].status;
    responses[responseIndex] = {
      ...responses[responseIndex],
      status,
      reviewedAt: new Date(),
      reviewedBy: organizerId,
      reviewMessage
    };

    this.saveResponses(responses);
    
    const response = responses[responseIndex];

    // Создаем уведомления в зависимости от нового статуса
    if (oldStatus === 'pending' && status === 'accepted') {
      // Уведомление для волонтера о принятии
      this.createVolunteerNotification({
        type: 'response_accepted',
        taskId: response.taskId,
        taskTitle: 'Задача', // В реальном приложении здесь будет название задачи
        volunteerId: response.volunteerId,
        volunteerName: response.volunteerName,
        message: 'Ваш отклик принят! Приглашаем к участию.',
        priority: 'high'
      });

      // Уведомление для организатора о принятии
      this.createOrganizerNotification({
        type: 'response_accepted',
        taskId: response.taskId,
        taskTitle: 'Задача',
        volunteerId: response.volunteerId,
        volunteerName: response.volunteerName,
        message: `${response.volunteerName} принял(а) приглашение на задачу.`,
        priority: 'medium'
      });
    } else if (oldStatus === 'pending' && status === 'rejected') {
      // Уведомление для волонтера об отклонении
      this.createVolunteerNotification({
        type: 'response_rejected',
        taskId: response.taskId,
        taskTitle: 'Задача',
        volunteerId: response.volunteerId,
        volunteerName: response.volunteerName,
        message: `К сожалению, ваш отклик отклонен. ${reviewMessage || ''}`,
        priority: 'medium'
      });
    }

    return response;
  }

  // Получить уведомления для организатора
  getNotificationsForOrganizer(organizerId: string): ResponseNotification[] {
    return this.getStoredNotifications()
      .filter(notif => notif.recipientId === organizerId && notif.recipientRole === 'organizer')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Получить уведомления для волонтера
  getNotificationsForVolunteer(volunteerId: string): ResponseNotification[] {
    return this.getStoredNotifications()
      .filter(notif => notif.recipientId === volunteerId && notif.recipientRole === 'volunteer')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Отметить уведомление как прочитанное
  markNotificationAsRead(notificationId: string): boolean {
    const notifications = this.getStoredNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications(notifications);
      return true;
    }
    return false;
  }

  // Получить количество непрочитанных уведомлений
  getUnreadCount(userId: string, role: 'organizer' | 'volunteer'): number {
    return this.getStoredNotifications()
      .filter(notif => notif.recipientId === userId && notif.recipientRole === role && !notif.read)
      .length;
  }

  // Создать уведомление о новой задаче для подходящих волонтеров
  createNewTaskNotifications(taskId: string, taskTitle: string, requiredSkills: string[]) {
    const volunteers = demoDatabase.getUsers().filter(user => user.role === 'volunteer');
    
    volunteers.forEach(volunteer => {
      // Проверяем, подходит ли волонтер по навыкам
      const hasMatchingSkills = requiredSkills.some(skill => 
        volunteer.skills?.includes(skill) || volunteer.profile?.skills?.includes(skill)
      );

      if (hasMatchingSkills || requiredSkills.length === 0) {
        this.createVolunteerNotification({
          type: 'new_task_available',
          taskId,
          taskTitle,
          volunteerId: volunteer.id,
          volunteerName: volunteer.name,
          message: `Новая задача "${taskTitle}" доступна для отклика!`,
          priority: 'high'
        });
      }
    });
  }

  // Статистика откликов
  getResponseStats(taskId?: string): ResponseStats {
    const responses = taskId ? this.getTaskResponses(taskId) : this.getStoredResponses();
    
    return {
      total: responses.length,
      pending: responses.filter(r => r.status === 'pending').length,
      accepted: responses.filter(r => r.status === 'accepted').length,
      rejected: responses.filter(r => r.status === 'rejected').length,
      withdrawn: responses.filter(r => r.status === 'withdrawn').length
    };
  }

  // Фильтрация откликов
  getFilteredResponses(taskId: string, filters: ResponseFilters): Response[] {
    const taskResponses = this.getTaskResponses(taskId);
    
    return taskResponses.filter(response => {
      // Фильтр по статусу
      if (filters.status !== 'all' && response.status !== filters.status) {
        return false;
      }

      // Фильтр по навыкам
      if (filters.skills.length > 0) {
        const allSkills = [...response.hardSkills, ...response.softSkills];
        const hasMatchingSkill = filters.skills.some(skill => 
          allSkills.some(responseSkill => 
            responseSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        if (!hasMatchingSkill) return false;
      }

      // Фильтр по опыту
      if (filters.experience !== 'all') {
        const experienceLevel = this.getExperienceLevel(response.experience);
        if (experienceLevel !== filters.experience) return false;
      }

      // Фильтр по доступности
      if (filters.availability !== 'all' && response.availability !== filters.availability) {
        return false;
      }

      return true;
    });
  }

  private getExperienceLevel(experience: string): 'beginner' | 'intermediate' | 'expert' {
    const exp = experience.toLowerCase();
    if (exp.includes('начинающ') || exp.includes('студент') || exp.includes('без опыта')) {
      return 'beginner';
    }
    if (exp.includes('опыт') || exp.includes('год') || exp.includes('лет')) {
      return 'intermediate';
    }
    if (exp.includes('эксперт') || exp.includes('профессионал') || exp.includes('специалист')) {
      return 'expert';
    }
    return 'beginner';
  }
}

export const responsesDatabase = new ResponsesDatabase();
