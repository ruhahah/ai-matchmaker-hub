import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Save, Sparkles, User, MapPin, Target, BookOpen, Plus, X, ArrowRight, CheckCircle, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { localStorageDB } from '@/lib/useLocalStorage';

interface ProfileData {
  name: string;
  age: string;
  location: string;
  bio: string;
  skills: string[];
  goals: string;
  embedding?: number[];
  aiArchetypes?: string[];
}

const KAZAKHSTAN_CITIES = [
  'Алматы', 'Астана', 'Шымкент', 'Актобе', 'Караганда',
  'Тараз', 'Павлодар', 'Усть-Каменогорск', 'Семей', 'Атырау',
  'Кызылорда', 'Актау', 'Кокшетау', 'Талдыкорган', 'Ерейментау',
  'Рудный', 'Петропавловск', 'Костанай', 'Уральск'
];

const COMMON_SKILLS = [
  'SMM', 'Маркетинг', 'Экология', 'Ремонт', 'Образование', 'IT',
  'Дизайн', 'Перевод', 'Организация', 'Логистика', 'Медицина',
  'Психология', 'Юриспруденция', 'Финансы', 'Журналистика',
  'Фотография', 'Видеосъемка', 'Музыка', 'Спорт', 'Туризм'
];

export default function VolunteerProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    age: '',
    location: '',
    bio: '',
    skills: [],
    goals: ''
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    archetypes: string[];
    optimization: string;
    recommendations: string[];
  } | null>(null);

  useEffect(() => {
    // Load existing profile from localStorageDB
    const existingProfile = localStorageDB.getVolunteerProfile('mock-volunteer-1');
    if (existingProfile) {
      setProfile({
        name: existingProfile.name || '',
        age: existingProfile.age || '',
        location: existingProfile.location || '',
        bio: existingProfile.bio || '',
        skills: existingProfile.skills || [],
        goals: existingProfile.goals || ''
      });
    }
  }, []);

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const generateEmbedding = async (text: string): Promise<number[]> => {
    // Mock embedding generation (в реальном приложении здесь будет вызов OpenAI API)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Генерируем мок вектор размером 1536 (как text-embedding-3-small)
    const embedding = new Array(1536).fill(0).map(() => Math.random() - 0.5);
    
    // Нормализуем вектор
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  };

  const analyzeProfile = async () => {
    setIsAnalyzing(true);
    
    try {
      // Mock AI анализ профиля
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const contextString = `${profile.bio} ${profile.skills.join(' ')} ${profile.goals}`;
      
      // Mock GPT-4o-mini анализ
      const mockArchetypes = [
        ['Природный защитник', 'Экологический активист', 'Зеленый волонтер'],
        ['Цифровой куратор', 'Технологический наставник', 'IT ментор'],
        ['Социальный организатор', 'Комьюнити менеджер', 'Групповой лидер'],
        ['Творческий помощник', 'Арт-волонтер', 'Культурный амбассадор']
      ];
      
      const selectedArchetypes = mockArchetypes[Math.floor(Math.random() * mockArchetypes.length)];
      
      const mockAnalysis = {
        archetypes: selectedArchetypes.slice(0, 3),
        optimization: '✨ Твой профиль оптимизирован для семантического поиска. Теперь организации найдут тебя по смыслу твоего опыта, а не только по ключевым словам.',
        recommendations: [
          'Добавь больше конкретных примеров твоего опыта',
          'Укажи количество выполненных проектов',
          'Включи сертификаты или достижения'
        ]
      };
      
      setAiAnalysis(mockAnalysis);
      setShowAnalysis(true);
      
    } catch (error) {
      toast({
        title: 'Ошибка анализа',
        description: 'Не удалось проанализировать профиль',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveProfile = async () => {
    if (!profile.name || !profile.bio) {
      toast({
        title: 'Ошибка валидации',
        description: 'Заполните имя и биографию',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Создаем контекстную строку для embedding
      const contextString = `${profile.bio} ${profile.skills.join(' ')} ${profile.goals}`;
      
      // Генерируем embedding
      const embedding = await generateEmbedding(contextString);
      
      // Сохраняем профиль с embedding
      const profileWithEmbedding = {
        ...profile,
        id: 'mock-volunteer-1',
        embedding,
        aiArchetypes: aiAnalysis?.archetypes || []
      };
      
      // Сохраняем в localStorageDB (мок Supabase)
      localStorageDB.saveVolunteerProfile(profileWithEmbedding);
      
      toast({
        title: '✅ Профиль сохранен!',
        description: 'Твой профиль теперь оптимизирован для поиска задач',
      });
      
      // Автоматический редирект на дашборд через 2 секунды
      setTimeout(() => {
        navigate('/volunteer/dashboard');
      }, 2000);
      
    } catch (error) {
      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить профиль',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Профиль волонтера</h1>
          <p className="text-gray-600">Создай свой уникальный профиль, чтобы организации могли найти тебя</p>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Базовая информация</TabsTrigger>
            <TabsTrigger value="skills">Навыки и цели</TabsTrigger>
            <TabsTrigger value="ai">AI Анализ</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Базовая информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя *</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Введите ваше имя"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Возраст</Label>
                    <Input
                      id="age"
                      value={profile.age}
                      onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="25"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Локация</Label>
                  <Select value={profile.location} onValueChange={(value) => setProfile(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите город" />
                    </SelectTrigger>
                    <SelectContent>
                      {KAZAKHSTAN_CITIES.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">О себе *</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Расскажите о своем опыте, мотивации и почему вы хотите стать волонтером..."
                    className="min-h-[120px]"
                  />
                  <p className="text-sm text-gray-500">
                    Подробная биография поможет AI лучше понять ваш профиль и найти подходящие задачи
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Навыки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Добавить навык..."
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Популярные навыки:</Label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_SKILLS.filter(skill => !profile.skills.includes(skill)).slice(0, 8).map((skill) => (
                        <Badge 
                          key={skill} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-blue-50"
                          onClick={() => setProfile(prev => ({ ...prev, skills: [...prev.skills, skill] }))}
                        >
                          + {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Цели
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={profile.goals}
                    onChange={(e) => setProfile(prev => ({ ...prev, goals: e.target.value }))}
                    placeholder="Чего вы хотите достичь как волонтер? Например: Хочу помогать животным, развивать экологические проекты, обучать детей..."
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Ваши цели помогут подобрать задачи, которые принесут вам максимум удовлетворения
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Анализ профиля
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Умной анализ профиля</h3>
                  <p className="text-gray-600 mb-6">
                    AI проанализирует ваш профиль и выдаст персональные рекомендации
                  </p>
                  
                  <Button 
                    onClick={analyzeProfile}
                    disabled={isAnalyzing || !profile.bio}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        AI анализирует...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Анализировать профиль
                      </>
                    )}
                  </Button>
                </div>

                {aiAnalysis && (
                  <div className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div>
                      <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Ваши архетипы:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {aiAnalysis.archetypes.map((archetype, index) => (
                          <Badge key={index} className="bg-purple-100 text-purple-700">
                            {archetype}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                      <p className="text-sm text-gray-700">{aiAnalysis.optimization}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-2">Рекомендации:</h4>
                      <ul className="space-y-1">
                        {aiAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => navigate('/volunteer/dashboard')}>
            Вернуться к дашборду
          </Button>
          
          <Button 
            onClick={saveProfile}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Сохранить профиль
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Redirect notification */}
      <Dialog open={isSaving} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Профиль успешно сохранен!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Перенаправляем вас на дашборд с персонализированными задачами...
            </p>
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
