import { responsesDatabase } from './responsesService';

// Push Notification Manager
export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private subscription: PushSubscription | null = null;

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  // Инициализация push-уведомлений
  async initialize(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications не поддерживаются');
        return false;
      }

      // Регистрация Service Worker
      const registration = await navigator.serviceWorker.ready;
      
      // Проверяем существующую подписку
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        this.subscription = existingSubscription;
        console.log('Push подписка уже существует');
        return true;
      }

      // Запрашиваем разрешение
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('Разрешение на уведомления не получено');
        return false;
      }

      // Создаем новую подписку
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || '')
      });

      this.subscription = subscription;
      
      // Сохраняем подписку на сервере (в реальном приложении)
      await this.saveSubscription(subscription);
      
      console.log('Push уведомления успешно инициализированы');
      return true;

    } catch (error) {
      console.error('Ошибка инициализации push уведомлений:', error);
      return false;
    }
  }

  // Отправка push-уведомления
  async sendNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    try {
      if (!('Notification' in window)) {
        console.warn('Уведомления не поддерживаются');
        return;
      }

      const permission = Notification.permission;
      
      if (permission === 'granted') {
        // Создаем уведомление
        const notification = new Notification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          ...options
        });

        // Обработка клика на уведомление
        notification.onclick = () => {
          window.focus();
          notification.close();
          
          // Открываем нужную страницу
          if (options.data?.url) {
            window.location.href = options.data.url;
          }
        };

        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
          notification.close();
        }, 5000);

      } else if (permission === 'default') {
        // Запрашиваем разрешение
        const newPermission = await Notification.requestPermission();
        if (newPermission === 'granted') {
          this.sendNotification(title, options);
        }
      }

    } catch (error) {
      console.error('Ошибка отправки уведомления:', error);
    }
  }

  // Системное уведомление о срочной задаче
  async sendUrgentTaskNotification(taskTitle: string, taskId: string, volunteerName: string): Promise<void> {
    await this.sendNotification(`🔥 Срочно нужен ${volunteerName}!`, {
      body: `Горит дедлайн! Нам срочно нужен человек с твоими навыками для задачи "${taskTitle}". Начало через 24 часа!`,
      data: {
        url: `/tasks/${taskId}`,
        taskId,
        type: 'urgent_task'
      },
      requireInteraction: true,
      tag: `urgent-${taskId}`
    });
  }

  // Уведомление о новом отклике
  async sendNewResponseNotification(taskTitle: string, volunteerName: string, taskId: string): Promise<void> {
    await this.sendNotification(`📝 Новый отклик на "${taskTitle}"`, {
      body: `${volunteerName} откликнулся на вашу задачу. Проверьте профиль и примите решение!`,
      data: {
        url: `/organizer?tab=responses`,
        taskId,
        type: 'new_response'
      },
      tag: `response-${taskId}`
    });
  }

  // Уведомление о назначении на задачу
  async sendTaskAssignedNotification(taskTitle: string, taskId: string): Promise<void> {
    await this.sendNotification(`✅ Вас назначили на задачу!`, {
      body: `Поздравляем! Вас выбрали для участия в "${taskTitle}". Проверьте детали и готовьтесь!`,
      data: {
        url: `/tasks/${taskId}`,
        taskId,
        type: 'task_assigned'
      },
      tag: `assigned-${taskId}`
    });
  }

  // Уведомление о завершении задачи
  async sendTaskCompletedNotification(taskTitle: string, taskId: string): Promise<void> {
    await this.sendNotification(`🎉 Задача "${taskTitle}" завершена!`, {
      body: `Отличная работа! Задача успешно завершена. Проверьте подтверждение и получите часы!`,
      data: {
        url: `/tasks/${taskId}`,
        taskId,
        type: 'task_completed'
      },
      tag: `completed-${taskId}`
    });
  }

  // Уведомление о верификации фото
  async sendPhotoVerificationNotification(status: 'approved' | 'rejected', taskTitle: string): Promise<void> {
    const title = status === 'approved' ? '✅ Фото подтверждено!' : '❌ Фото отклонено';
    const body = status === 'approved' 
      ? `Ваше фото для задачи "${taskTitle}" подтверждено. Часы засчитаны!`
      : `Ваше фото для задачи "${taskTitle}" отклонено. Попробуйте загрузить другое фото.`;

    await this.sendNotification(title, {
      body,
      data: {
        url: '/volunteer',
        type: 'photo_verification',
        status
      },
      tag: `verification-${taskTitle}`
    });
  }

  // Преобразование VAPID ключа
  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Сохранение подписки (в реальном приложении отправка на сервер)
  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    try {
      // В реальном приложении здесь был бы API вызов
      console.log('Push subscription сохранена:', subscription);
      
      // Для демо сохраняем в localStorage
      localStorage.setItem('pushSubscription', JSON.stringify(subscription));
    } catch (error) {
      console.error('Ошибка сохранения подписки:', error);
    }
  }

  // Получение статуса уведомлений
  getNotificationStatus(): 'granted' | 'denied' | 'default' {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  // Отписка от уведомлений
  async unsubscribe(): Promise<boolean> {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        this.subscription = null;
        console.log('Отписка от push уведомлений выполнена');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка отписки от уведомлений:', error);
      return false;
    }
  }
}

// Экспорт экземпляра
export const pushNotifications = PushNotificationManager.getInstance();
