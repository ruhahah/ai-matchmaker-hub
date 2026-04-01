import { demoDatabase } from './demoDatabase';
import { responsesDatabase } from './responsesService';

// Фоновый AI-менеджер для проактивных уведомлений
export class BackgroundAIManager {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  // Запуск фонового процесса (каждые 5 минут для демо)
  start() {
    if (this.isRunning) {
      console.log('Background AI Manager already running');
      return;
    }

    console.log('🤖 Starting Background AI Manager...');
    this.isRunning = true;
    
    // Для демо - проверяем каждые 30 секунд
    this.intervalId = setInterval(() => {
      this.checkUrgentTasks();
    }, 30000);

    // Немедленная проверка при старте
    this.checkUrgentTasks();
  }

  // Остановка фонового процесса
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Background AI Manager stopped');
  }

  // Проверка срочных задач
  private async checkUrgentTasks() {
    try {
      console.log('🔍 Checking for urgent tasks...');
      
      const tasks = demoDatabase.getTasks();
      const profiles = demoDatabase.getProfiles();
      const volunteers = profiles.filter(p => p.role === 'volunteer');

      for (const task of tasks) {
        // Проверяем, начинается ли задача через 24 часа
        if (this.isTaskWithin24Hours(task)) {
          await this.handleUrgentTask(task, volunteers);
        }
      }
    } catch (error) {
      console.error('Background check error:', error);
    }
  }

  // Проверка, начинается ли задача в течение 24 часов
  private isTaskWithin24Hours(task: any): boolean {
    if (!task.startTime) return false;

    const taskStart = new Date(task.startTime);
    const now = new Date();
    const timeDiff = taskStart.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Если до начала меньше 24 часов и больше 1 часа
    return hoursDiff <= 24 && hoursDiff > 1;
  }

  // Обработка срочной задачи
  private async handleUrgentTask(task: any, volunteers: any[]) {
    const currentVolunteers = this.getCurrentVolunteerCount(task);
    const requiredVolunteers = task.requiredVolunteers || 1;

    // Если волонтеров недостаточно
    if (currentVolunteers < requiredVolunteers) {
      console.log(`🚨 Urgent task detected: ${task.title}`);
      
      // Находим подходящих волонтеров
      const suitableVolunteers = this.findSuitableVolunteers(task, volunteers);
      
      // Отправляем уведомления
      for (const volunteer of suitableVolunteers.slice(0, 3)) { // Максимум 3 уведомления
        await this.sendUrgentNotification(task, volunteer);
      }
    }
  }

  // Получение текущего количества волонтеров
  private getCurrentVolunteerCount(task: any): number {
    const responses = responsesDatabase.getTaskResponses(task.id);
    return responses.filter(r => r.status === 'accepted').length;
  }

  // Поиск подходящих волонтеров
  private findSuitableVolunteers(task: any, volunteers: any[]): any[] {
    return volunteers.filter(volunteer => {
      // Проверяем навыки
      const hasMatchingSkills = task.skills?.some((skill: string) => 
        volunteer.skills.some((volSkill: string) => 
          volSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(volSkill.toLowerCase())
        )
      );

      // Проверяем локацию
      const isSameLocation = task.location && volunteer.location &&
        (task.location.toLowerCase().includes('астана') && volunteer.location.toLowerCase().includes('астана'));

      // Проверяем доступность (не занят в других задачах)
      const isAvailable = this.isVolunteerAvailable(volunteer, task);

      return hasMatchingSkills && isSameLocation && isAvailable;
    }).sort((a, b) => b.stats.rating - a.stats.rating); // Сортируем по рейтингу
  }

  // Проверка доступности волонтера
  private isVolunteerAvailable(volunteer: any, task: any): boolean {
    // Простая логика: проверяем, не занят ли волонтер в это время
    const tasks = demoDatabase.getTasks();
    const taskStart = new Date(task.startTime);
    
    return !tasks.some(otherTask => {
      if (otherTask.id === task.id) return false;
      
      const otherStart = new Date(otherTask.startTime);
      const timeDiff = Math.abs(taskStart.getTime() - otherStart.getTime());
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // Если задачи пересекаются по времени (в пределах 2 часов)
      return hoursDiff < 2;
    });
  }

  // Отправка срочного уведомления
  private async sendUrgentNotification(task: any, volunteer: any) {
    try {
      // Создаем уведомление для волонтера
      const urgentNotification = {
        id: `urgent-${Date.now()}-${volunteer.id}`,
        type: 'new_task_available' as const,
        taskId: task.id,
        taskTitle: task.title,
        volunteerId: volunteer.id,
        volunteerName: volunteer.name,
        recipientId: volunteer.id,
        recipientRole: 'volunteer' as const,
        message: `🔥 ГОРЯЩИЙ ДЕДЛАЙН! Нам срочно нужен человек с твоими навыками для задачи "${task.title}". Начало через 24 часа!`,
        createdAt: new Date(),
        read: false,
        priority: 'high' as const,
        actionUrl: `/tasks/${task.id}`
      };

      // Добавляем в базу уведомлений
      responsesDatabase.createVolunteerNotification({
        type: 'new_task_available',
        taskId: task.id,
        taskTitle: task.title,
        volunteerId: volunteer.id,
        volunteerName: volunteer.name,
        message: urgentNotification.message,
        priority: 'high'
      });

      console.log(`📧 Urgent notification sent to ${volunteer.name} for task: ${task.title}`);

      // Имитация push/email уведомления (в реальном приложении здесь был бы API вызов)
      this.simulatePushNotification(volunteer, urgentNotification);

    } catch (error) {
      console.error('Failed to send urgent notification:', error);
    }
  }

  // Имитация push-уведомления
  private simulatePushNotification(volunteer: any, notification: any) {
    // В реальном приложении здесь был бы вызов Firebase Push API или Email API
    console.log(`
🔥 PUSH NOTIFICATION:
To: ${volunteer.name} (${volunteer.email || 'no-email'})
Title: 🚨 Срочный запрос!
Body: ${notification.message}
Time: ${new Date().toLocaleString('ru-RU')}
    `);

    // В браузере можно показать реальное уведомление
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 Срочный запрос волонтера!', {
        body: notification.message,
        icon: '/favicon.ico',
        tag: `urgent-${notification.taskId}`
      });
    }
  }

  // Запрос разрешения на уведомления
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}

// Глобальный экземпляр менеджера
export const backgroundManager = new BackgroundAIManager();
