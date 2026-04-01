import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { initializeVideoDemoData, resetVideoDemoData } from '@/lib/videoDemoData';
import { Play, RotateCcw, Users, Calendar, MessageSquare } from 'lucide-react';

export default function DemoDataManager() {
  const handleInitialize = () => {
    initializeVideoDemoData();
    window.location.reload();
  };

  const handleReset = () => {
    if (confirm('Вы уверены, что хотите сбросить все демо-данные?')) {
      resetVideoDemoData();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">🎬 Демо-данные для видео</h1>
          <p className="text-gray-600">Управление демонстрационными данными для записи видео</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Что будет создано
            </CardTitle>
            <CardDescription>
              При инициализации будут добавлены следующие данные для демонстрации
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  <Calendar className="w-3 h-3 mr-1" />
                  5 новых задач
                </Badge>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Техническая помощь в школе</li>
                  <li>• Фотосессия для приюта</li>
                  <li>• Перевод для гостей</li>
                  <li>• Ремонт детской площадки</li>
                  <li>• Кулинарный мастер-класс</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  <Users className="w-3 h-3 mr-1" />
                  Профиль пользователя
                </Badge>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ашим Жумабай (волонтер)</li>
                  <li>• Навыки: Программирование, IT, Фото</li>
                  <li>• Рейтинг: 4.8, 6 задач выполнено</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Отклики и уведомления
                </Badge>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 3 отклика на задачи</li>
                  <li>• 3 запроса в дружбу</li>
                  <li>• 2 командных приглашения</li>
                  <li>• 1 принятая дружба</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  <Users className="w-3 h-3 mr-1" />
                  Друзья для демонстрации
                </Badge>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Айгуль Смаилова</li>
                  <li>• Дмитрий Петров</li>
                  <li>• Назира Абдуллина</li>
                  <li>• Ерлан Нурланов</li>
                  <li>• Светлана Козлова</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Управление</CardTitle>
            <CardDescription>
              Инициализируйте или сбросьте демо-данные
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={handleInitialize} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Инициализировать демо-данные
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Сбросить все данные
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📹 Сценарии для видео</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">1. Главная страница</h4>
                <p className="text-sm text-gray-600">
                  Показать список задач, фильтры, поиск
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">2. Профиль волонтера</h4>
                <p className="text-sm text-gray-600">
                  Показать профиль Ашима, навыки, статистику
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">3. Отклики на задачи</h4>
                <p className="text-sm text-gray-600">
                  Показать как откликаться на задачи
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">4. Друзья</h4>
                <p className="text-sm text-gray-600">
                  Показать запросы в дружбу, приглашения
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">5. Создание задачи</h4>
                <p className="text-sm text-gray-600">
                  Показать AI-интервью для создания задачи
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">6. Уведомления</h4>
                <p className="text-sm text-gray-600">
                  Показать уведомления об откликах
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
