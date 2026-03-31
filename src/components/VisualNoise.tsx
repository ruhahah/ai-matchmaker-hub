import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Users, MapPin, Clock, TrendingUp, Zap, CheckCircle } from 'lucide-react';

interface ActivityFeedItem {
  id: string;
  type: 'match' | 'application' | 'verification' | 'task_created';
  volunteerName?: string;
  taskTitle?: string;
  score?: number;
  location?: string;
  timestamp: string;
  message: string;
}

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  type: 'volunteer' | 'task' | 'organization';
  title: string;
  description: string;
}

interface VisualNoiseProps {
  className?: string;
}

export default function VisualNoise({ className = "" }: VisualNoiseProps) {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([
    {
      id: '1',
      type: 'verification',
      volunteerName: 'Динара Ержанова',
      taskTitle: 'Покраска забора',
      message: 'AI подтвердил выполнение задачи',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      score: 0.92
    },
    {
      id: '2',
      type: 'match',
      volunteerName: 'Айгерим Мамедов',
      taskTitle: 'Субботник в парке Абай',
      message: 'Жасулан получил 98% совпадения',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      score: 0.98,
      location: 'Алматы'
    },
    {
      id: '3',
      type: 'application',
      volunteerName: 'Бауржан Оспанов',
      taskTitle: 'Помощь приюту Аяулым',
      message: 'Новая заявка на срочную помощь',
      timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      type: 'task_created',
      taskTitle: 'Экологическая акция: Чистый Бадам',
      message: 'Организатор создал новую задачу',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      location: 'Берег реки Бадам'
    }
  ]);

  const [mapPoints, setMapPoints] = useState<MapPoint[]>([
    {
      id: 'v1',
      lat: 43.2364,
      lng: 76.9147,
      type: 'volunteer',
      title: 'Айгерим Мамедов',
      description: 'SMM-специалист, готов помочь с цифровым маркетингом'
    },
    {
      id: 'v2',
      lat: 43.2220,
      lng: 76.8512,
      type: 'volunteer',
      title: 'Динара Ержанова',
      description: 'Художник-декоратор из Алматы'
    },
    {
      id: 'v3',
      lat: 51.1694,
      lng: 71.4491,
      type: 'volunteer',
      title: 'Бауржан Оспанов',
      description: 'Ветеринарный врач из Шымкента'
    },
    {
      id: 't1',
      lat: 43.2567,
      lng: 76.9147,
      type: 'task',
      title: 'Субботник в парке Абай',
      description: 'Помощь в уборке и благоустройстве парка'
    },
    {
      id: 't2',
      lat: 50.3159,
      lng: 57.1579,
      type: 'task',
      title: 'Помощь приюту Аяулым',
      description: 'Ежедневная помощь бездомным животным'
    },
    {
      id: 't3',
      lat: 43.2220,
      lng: 76.8512,
      type: 'task',
      title: 'Экологическая акция: Чистый Бадам',
      description: 'Сбор мусора и посадка деревьев'
    },
    {
      id: 'o1',
      lat: 43.2364,
      lng: 76.9147,
      type: 'organization',
      title: 'AI Matchmaker Hub',
      description: 'Центральный офис платформы'
    }
  ]);

  const getActivityIcon = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'verification':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'match':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'application':
        return <Activity className="w-4 h-4 text-orange-600" />;
      case 'task_created':
        return <Zap className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'verification':
        return 'border-green-200 bg-green-50';
      case 'match':
        return 'border-blue-200 bg-blue-50';
      case 'application':
        return 'border-orange-200 bg-orange-50';
      case 'task_created':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} минут назад`;
    if (diffMins < 120) return `${Math.floor(diffMins / 60)} часов назад`;
    return `${Math.floor(diffMins / 1440)} дней назад`;
  };

  return (
    <div className={`fixed top-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Live Activity Feed
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 max-h-96 overflow-y-auto">
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <div 
              key={activity.id}
              className={`p-3 rounded-lg border-l-4 ${getActivityColor(activity.type)} transition-all duration-300 hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium text-gray-900">
                      {activity.volunteerName && (
                        <span className="font-semibold">{activity.volunteerName}</span>
                      )}
                      {activity.taskTitle && (
                        <span> → {activity.taskTitle}</span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {getRelativeTime(activity.timestamp)}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {activity.message}
                  </div>
                  
                  {activity.score && (
                    <div className="mt-2">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {Math.round(activity.score * 100)}% совпадение
                      </Badge>
                    </div>
                  )}
                  
                  {activity.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardHeader className="pt-2 border-t">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-600" />
          Активность в Казахстане
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3">
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs text-gray-600 bg-white/90 backdrop-blur-sm rounded px-2 py-1">
              🗺️ Интерактивная карта Казахстана
            </div>
          </div>
          
          <div className="absolute inset-0">
            {mapPoints.map((point) => (
              <div
                key={point.id}
                className="absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${((point.lng - 71) / 5 * 100) + 50}%`,
                  top: `${((51.17 - point.lat) / 20 * 100) + 50}%`,
                }}
                title={`${point.title}: ${point.description}`}
              >
                <div 
                  className={`w-2 h-2 rounded-full border-2 ${
                    point.type === 'volunteer' ? 'bg-blue-500 border-blue-600' :
                    point.type === 'task' ? 'bg-green-500 border-green-600' :
                    'bg-purple-500 border-purple-600'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </div>
  );
}
