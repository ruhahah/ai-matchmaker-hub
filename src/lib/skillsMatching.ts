import { DemoProfile, DemoTask } from './demoDatabaseFixed';

// Стабильные навыки для пользователей
export interface UserSkill {
  id: string;
  name: string;
  category: 'technical' | 'social' | 'creative' | 'sports' | 'professional' | 'educational';
  level: number; // 1-5 уровень
  experience: number; // количество выполненных задач с этим навыком
  verified: boolean; // подтвержден ли навык
}

// Результат сопоставления навыков
export interface SkillMatchResult {
  taskId: string;
  taskTitle: string;
  matchScore: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  skillBonus: number; // бонус за совпадение навыков
  priority: 'high' | 'medium' | 'low';
}

// Категории навыков и их веса
const SKILL_CATEGORIES = {
  technical: { weight: 1.2, name: 'Технические' },
  social: { weight: 1.5, name: 'Социальные' },
  creative: { weight: 1.1, name: 'Творческие' },
  sports: { weight: 1.0, name: 'Спортивные' },
  professional: { weight: 1.3, name: 'Профессиональные' },
  educational: { weight: 1.4, name: 'Образовательные' }
};

// Базовые навыки для разных типов задач
const TASK_SKILL_REQUIREMENTS = {
  'Экология': ['Экология', 'Физическая работа', 'Организация'],
  'Ветеринария': ['Ветеринария', 'Уход за животными', 'Ответственность'],
  'Работа с детьми': ['Работа с детьми', 'Педагогика', 'Терпение'],
  'Образование': ['Обучение', 'Педагогика', 'Коммуникация'],
  'Спорт': ['Спорт', 'Тренерство', 'Организация'],
  'Музыка': ['Музыка', 'Творчество', 'Искусство'],
  'Кулинария': ['Кулинария', 'Работа с продуктами', 'Гигиена'],
  'IT': ['IT', 'Программирование', 'Цифровая грамотность'],
  'Юриспруденция': ['Юриспруденция', 'Консалтинг', 'Документоведение'],
  'Медицина': ['Медицина', 'Первая помощь', 'Здравоохранение'],
  'Строительство': ['Строительство', 'Ремонт', 'Инженерия'],
  'Маркетинг': ['Маркетинг', 'SMM', 'Продажи'],
  'Фотография': ['Фотография', 'Дизайн', 'Видеомонтаж'],
  'Логистика': ['Логистика', 'Организация', 'Транспорт'],
  'Театр': ['Театр', 'Искусство', 'Творчество'],
  'Литература': ['Литература', 'Образование', 'Коммуникация'],
  'Иностранные языки': ['Иностранные языки', 'Обучение', 'Коммуникация'],
  'Благоустройство': ['Благоустройство', 'Ландшафтный дизайн', 'Физическая работа']
};

// Умное сопоставление навыков с задачами
export class SkillsMatchingService {
  // Получение навыков пользователя
  static getUserSkills(userId: string): UserSkill[] {
    const skillsStr = localStorage.getItem(`user-skills-${userId}`);
    if (skillsStr) {
      return JSON.parse(skillsStr);
    }
    
    // Начальные навыки для демо
    const initialSkills: UserSkill[] = [
      { id: 'skill-1', name: 'Коммуникация', category: 'social', level: 3, experience: 5, verified: true },
      { id: 'skill-2', name: 'Организация', category: 'social', level: 2, experience: 3, verified: true },
      { id: 'skill-3', name: 'Ответственность', category: 'social', level: 4, experience: 8, verified: true }
    ];
    
    this.saveUserSkills(userId, initialSkills);
    return initialSkills;
  }

  // Сохранение навыков пользователя
  static saveUserSkills(userId: string, skills: UserSkill[]): void {
    localStorage.setItem(`user-skills-${userId}`, JSON.stringify(skills));
  }

  // Добавление нового навыка
  static addUserSkill(userId: string, skill: Omit<UserSkill, 'id' | 'experience'>): UserSkill {
    const skills = this.getUserSkills(userId);
    const newSkill: UserSkill = {
      ...skill,
      id: `skill-${Date.now()}`,
      experience: 0
    };
    
    skills.push(newSkill);
    this.saveUserSkills(userId, skills);
    return newSkill;
  }

  // Обновление уровня навыка
  static updateSkillLevel(userId: string, skillId: string, newLevel: number): void {
    const skills = this.getUserSkills(userId);
    const skillIndex = skills.findIndex(s => s.id === skillId);
    
    if (skillIndex !== -1) {
      skills[skillIndex].level = newLevel;
      this.saveUserSkills(userId, skills);
    }
  }

  // Увеличение опыта навыка после выполнения задачи
  static addSkillExperience(userId: string, skillName: string, taskId: string): void {
    const skills = this.getUserSkills(userId);
    const skill = skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    
    if (skill) {
      skill.experience += 1;
      // Повышение уровня каждые 5 единиц опыта
      if (skill.experience % 5 === 0 && skill.level < 5) {
        skill.level = Math.min(skill.level + 1, 5);
      }
      this.saveUserSkills(userId, skills);
    }
  }

  // Расчет совпадения навыков с задачей
  static calculateSkillMatch(userId: string, task: DemoTask): SkillMatchResult {
    const userSkills = this.getUserSkills(userId);
    const taskSkills = task.skills || [];
    
    // Базовый счет совпадения
    let matchScore = 50; // базовый балл
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    
    // Проверяем каждый требуемый навык
    taskSkills.forEach(taskSkill => {
      const userSkill = userSkills.find(us => 
        us.name.toLowerCase() === taskSkill.toLowerCase() ||
        this.isSkillRelated(us.name, taskSkill)
      );
      
      if (userSkill) {
        matchedSkills.push(taskSkill);
        // Бонус за уровень навыка
        const levelBonus = userSkill.level * 5;
        // Бонус за опыт
        const experienceBonus = Math.min(userSkill.experience * 2, 20);
        // Бонус за подтверждение
        const verifiedBonus = userSkill.verified ? 10 : 0;
        
        matchScore += levelBonus + experienceBonus + verifiedBonus;
      } else {
        missingSkills.push(taskSkill);
        // Штраф за отсутствующий навык
        matchScore -= 10;
      }
    });

    // Бонус за количество совпадающих навыков
    const matchRatio = matchedSkills.length / Math.max(taskSkills.length, 1);
    const ratioBonus = matchRatio * 20;
    matchScore += ratioBonus;

    // Ограничиваем счет в диапазоне 0-100
    matchScore = Math.max(0, Math.min(100, matchScore));

    // Определяем приоритет на основе счета
    let priority: 'high' | 'medium' | 'low';
    if (matchScore >= 75) {
      priority = 'high';
    } else if (matchScore >= 50) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    // Дополнительный бонус за совпадение категорий
    const skillBonus = this.calculateCategoryBonus(userSkills, taskSkills);

    return {
      taskId: task.id,
      taskTitle: task.title,
      matchScore: Math.round(matchScore + skillBonus),
      matchedSkills,
      missingSkills,
      skillBonus,
      priority
    };
  }

  // Проверка связанных навыков
  private static isSkillRelated(userSkill: string, taskSkill: string): boolean {
    const relatedSkills: Record<string, string[]> = {
      'Коммуникация': ['Общение', 'Коммуникация', 'SMM', 'Маркетинг'],
      'Организация': ['Планирование', 'Менеджмент', 'Координация'],
      'Ответственность': ['Надежность', 'Исполнительность', 'Внимательность'],
      'IT': ['Программирование', 'Компьютеры', 'Технологии'],
      'Творчество': ['Искусство', 'Дизайн', 'Креативность'],
      'Обучение': ['Педагогика', 'Образование', 'Преподавание']
    };

    const related = relatedSkills[userSkill] || [];
    return related.some(related => 
      related.toLowerCase() === taskSkill.toLowerCase()
    );
  }

  // Расчет бонуса за совпадение категорий
  private static calculateCategoryBonus(userSkills: UserSkill[], taskSkills: string[]): number {
    let bonus = 0;
    
    taskSkills.forEach(taskSkill => {
      const matchingUserSkill = userSkills.find(us => 
        us.name.toLowerCase() === taskSkill.toLowerCase() ||
        this.isSkillRelated(us.name, taskSkill)
      );
      
      if (matchingUserSkill) {
        const categoryWeight = SKILL_CATEGORIES[matchingUserSkill.category]?.weight || 1;
        bonus += categoryWeight * 5;
      }
    });

    return Math.round(bonus);
  }

  // Получение всех задач с расчетом совпадения
  static getTasksWithSkillMatch(userId: string, tasks: DemoTask[]): SkillMatchResult[] {
    return tasks.map(task => this.calculateSkillMatch(userId, task))
      .sort((a, b) => b.matchScore - a.matchScore); // Сортировка по убыванию счета
  }

  // Получение рекомендованных задач
  static getRecommendedTasks(userId: string, tasks: DemoTask[], limit: number = 10): SkillMatchResult[] {
    const tasksWithMatch = this.getTasksWithSkillMatch(userId, tasks);
    
    // Фильтруем задачи с высоким и средним приоритетом
    const recommendedTasks = tasksWithMatch.filter(result => 
      result.priority === 'high' || result.priority === 'medium'
    );
    
    return recommendedTasks.slice(0, limit);
  }

  // Получение задач для изучения новых навыков
  static getLearningTasks(userId: string, tasks: DemoTask[], limit: number = 5): SkillMatchResult[] {
    const tasksWithMatch = this.getTasksWithSkillMatch(userId, tasks);
    
    // Фильтруем задачи с низким приоритетом (где не хватает навыков)
    const learningTasks = tasksWithMatch.filter(result => 
      result.priority === 'low' && result.missingSkills.length > 0
    );
    
    return learningTasks.slice(0, limit);
  }

  // Получение статистики навыков пользователя
  static getUserSkillStats(userId: string): {
    totalSkills: number;
    verifiedSkills: number;
    averageLevel: number;
    totalExperience: number;
    topSkills: UserSkill[];
  } {
    const skills = this.getUserSkills(userId);
    
    return {
      totalSkills: skills.length,
      verifiedSkills: skills.filter(s => s.verified).length,
      averageLevel: skills.length > 0 ? 
        Math.round(skills.reduce((sum, s) => sum + s.level, 0) / skills.length * 10) / 10 : 0,
      totalExperience: skills.reduce((sum, s) => sum + s.experience, 0),
      topSkills: skills
        .sort((a, b) => (b.level * 10 + b.experience) - (a.level * 10 + a.experience))
        .slice(0, 5)
    };
  }

  // Поиск задач по навыкам
  static searchTasksBySkills(userId: string, tasks: DemoTask[], searchQuery: string): SkillMatchResult[] {
    const userSkills = this.getUserSkills(userId);
    const query = searchQuery.toLowerCase();
    
    return tasks
      .map(task => this.calculateSkillMatch(userId, task))
      .filter(result => 
        result.matchedSkills.some(skill => 
          skill.toLowerCase().includes(query)
        ) ||
        result.taskTitle.toLowerCase().includes(query)
      )
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  // Получение уровня владения навыком
  static getSkillLevelName(level: number): string {
    const levels = [
      { min: 0, max: 1, name: 'Начинающий' },
      { min: 2, max: 2, name: 'Любитель' },
      { min: 3, max: 3, name: 'Продвинутый' },
      { min: 4, max: 4, name: 'Эксперт' },
      { min: 5, max: 5, name: 'Мастер' }
    ];
    
    return levels.find(l => level >= l.min && level <= l.max)?.name || 'Начинающий';
  }

  // Получение прогресса до следующего уровня
  static getSkillProgress(skill: UserSkill): {
    currentLevel: number;
    nextLevel: number;
    progress: number; // 0-100
    experienceToNext: number;
  } {
    const currentLevel = skill.level;
    const nextLevel = Math.min(skill.level + 1, 5);
    const experienceForCurrentLevel = (currentLevel - 1) * 5;
    const experienceForNextLevel = (nextLevel - 1) * 5;
    const experienceInLevel = skill.experience - experienceForCurrentLevel;
    const experienceToNext = experienceForNextLevel - skill.experience;
    const progress = Math.min((experienceInLevel / 5) * 100, 100);
    
    return {
      currentLevel,
      nextLevel,
      progress,
      experienceToNext
    };
  }
}
