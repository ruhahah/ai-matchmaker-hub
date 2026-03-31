import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, Award, QrCode, Calendar, MapPin, Users, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  location?: string;
  skills?: string[];
  urgency?: 'low' | 'medium' | 'high';
  status?: string;
}

interface Volunteer {
  id: string;
  name: string;
  skills?: string[];
  avatar?: string;
}

interface ImpactCertificateProps {
  task: Task;
  volunteer: Volunteer;
  onGenerate?: () => void;
}

export default function ImpactCertificate({ task, volunteer, onGenerate }: ImpactCertificateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificate, setCertificate] = useState<string | null>(null);
  const { toast } = useToast();

  const generateCertificate = async () => {
    setIsGenerating(true);
    
    try {
      // Mock AI generation с персонализацией
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const impactMessages = [
        `${volunteer.name}, твой вклад в ${task.title.toLowerCase()} сделал город на ${Math.floor(Math.random() * 10 + 5)}% лучше! Твои навыки ${(volunteer.skills || []).slice(0, 2).join(' и ')} были ключевыми для успеха.`,
        `Благодаря ${volunteer.name}, ${task.location || 'наше город'} стало уютнее! Твоя работа над ${task.title.toLowerCase()} вдохновила ${Math.floor(Math.random() * 5 + 3)} других людей присоединиться к волонтерству.`,
        `${volunteer.name}, твой профессионализм в ${(volunteer.skills || [])[0] || 'волонтерской деятельности'} превзошел все ожидания! ${task.title} теперь пример для всего сообщества.`
      ];
      
      const aiMessage = impactMessages[Math.floor(Math.random() * impactMessages.length)];
      
      setCertificate(aiMessage);
      setIsOpen(true); // Открываем модальное окно после генерации
      
      toast({
        title: '✅ Сертификат сгенерирован!',
        description: 'AI создал персональную благодарность для вас',
      });
      
      if (onGenerate) onGenerate();
      
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сгенерировать сертификат',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCertificate = () => {
    // Mock PDF download
    const certificateData = `
      ========================================
      AI-СЕРТИФИКАТ ВОЛОНТЕРА
      ========================================
      
      Имя: ${volunteer.name}
      Задача: ${task.title}
      Место: ${task.location || 'Не указано'}
      Навыки: ${(volunteer.skills || []).join(', ')}
      
      ${certificate}
      
      Дата: ${new Date().toLocaleDateString('ru-RU')}
      
      QR-код: https://volunteer.example.com/${volunteer.id}
      ========================================
    `;
    
    const blob = new Blob([certificateData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI-Сертификат_${volunteer.name}_${task.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: '📥 Сертификат загружен',
      description: 'Файл сохранен на вашем устройстве',
    });
  };

  if (task.status !== 'completed') {
    return null;
  }

  return (
    <>
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            AI-Сертификат вклада
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Задача выполнена! Получите персональный AI-сертификат с анализом вашего вклада.
            </p>
            
            <Button 
              onClick={generateCertificate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  AI создает сертификат...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Получить AI-Сертификат
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-500" />
              Персональный AI-Сертификат
            </DialogTitle>
          </DialogHeader>
          
          {certificate && (
            <div className="space-y-6">
              {/* Certificate Header */}
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-200">
                <div className="mb-4">
                  <Award className="w-16 h-16 text-yellow-500 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-gray-800">AI-Сертификат Волонтера</h2>
                  <p className="text-gray-600">Сгенерирован искусственным интеллектом</p>
                </div>
                
                {/* Volunteer Info */}
                <div className="mb-4 text-left bg-white p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{volunteer.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Задача:</span>
                      <p className="text-gray-600">{task.title}</p>
                    </div>
                    <div>
                      <span className="font-medium">Место:</span>
                      <p className="text-gray-600">{task.location || 'Не указано'}</p>
                    </div>
                  </div>
                </div>
                
                {/* AI Impact Message */}
                <div className="text-left bg-white p-4 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI-Анализ вклада:
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{certificate}</p>
                </div>
                
                {/* Skills Used */}
                <div className="text-left">
                  <span className="font-medium">Примененные навыки:</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(volunteer.skills || []).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Date and Signature */}
                <div className="text-left text-sm text-gray-600 mt-4 pt-4 border-t">
                  <p>Дата: {new Date().toLocaleDateString('ru-RU')}</p>
                  <p className="mt-2 font-medium">Подпись: AI Impact Analyzer v2.0</p>
                </div>
                
                {/* QR Code */}
                <div className="flex justify-center mt-4">
                  <div className="bg-white p-3 rounded-lg border">
                    <QrCode className="w-16 h-16 text-gray-800" />
                    <p className="text-xs text-center mt-1">Профиль волонтера</p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={downloadCertificate} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Скачать PDF
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
