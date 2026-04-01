import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Проверяем, установлено ли приложение
    const checkInstalled = () => {
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isInStandaloneMode || isInWebAppiOS);
    };

    checkInstalled();

    // Слушаем событие beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Показываем баннер через 3 секунды
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallBanner(true);
        }
      }, 3000);
    };

    // Слушаем событие установки
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Регистрируем Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker зарегистрирован:', registration);
        })
        .catch(error => {
          console.error('Ошибка регистрации Service Worker:', error);
        });

      // Запрашиваем разрешение на push-уведомления
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('Разрешение на уведомления:', permission);
        });
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Пользователь установил приложение');
    } else {
      console.log('Пользователь отказался от установки');
    }

    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    // Не показываем баннер еще 24 часа
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  // Проверяем, не dismiss ли пользователь баннер недавно
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      const timeDiff = Date.now() - parseInt(dismissed);
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setShowInstallBanner(false);
      }
    }
  }, []);

  if (isInstalled) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Баннер установки PWA */}
      {showInstallBanner && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">
                    Установите Sun Proactive
                  </h3>
                  <p className="text-xs opacity-90 mb-3">
                    Получайте push-уведомления о срочных задачах и работайте офлайн
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleInstallClick}
                      className="bg-white text-blue-600 hover:bg-blue-50 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Установить
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismissBanner}
                      className="text-white hover:bg-white/20 text-xs"
                    >
                      Не сейчас
                    </Button>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismissBanner}
                  className="text-white hover:bg-white/20 p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
