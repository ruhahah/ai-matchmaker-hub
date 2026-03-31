import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://vnghhecncidqeuoiadpq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ===== KAZAKHSTAN VOLUNTEER PROFILES =====
const kazakhstanVolunteers = [
  {
    name: 'Айгерим Мамедов',
    avatar: '',
    bio: 'SMM-специалист с 5-летним опытом. Работал с крупными казахстанскими брендами, включая Kaspi Bank и Chocofamily. Веду Telegram-канал с 10к+ подписчиками о цифровом маркетинге.',
    skills: ['SMM', 'цифровой маркетинг', 'контент-маркетинг', 'Telegram', 'социальные сети', 'копирайтинг'],
    role: 'volunteer'
  },
  {
    name: 'Динара Ержанова',
    avatar: '',
    bio: 'Профессиональный художник-декоратор из Алматы. Специализируюсь на росписи стен в общественных местах, включая парки, школы и культурные центры. Имею портфолио с работами в Национальной библиотеке РК.',
    skills: ['живопись', 'декорирование', 'дизайн', 'роспись стен', 'художественное оформление'],
    role: 'volunteer'
  },
  {
    name: 'Бауржан Оспанов',
    avatar: '',
    bio: 'Ветеринарный врач из Шымкента. Организую выездную стерилизацию бездомных животных в Алматинской области. Есть медицинское образование и опыт работы в приюте для животных более 3 лет.',
    skills: ['ветеринария', 'помощь животным', 'стерилизация', 'медицина', 'бездомные животные'],
    role: 'volunteer'
  },
  {
    name: 'Гульнара Султанова',
    avatar: '',
    bio: 'Студентка 4 курса Казахского национального университета им. аль-Фараби по специальности "Компьютерные науки". Активистка волонтерского движения, помогаю в организации IT-мероприятий для школьников.',
    skills: ['программирование', 'IT', 'образование', 'менторство', 'волонтерство', 'организация мероприятий'],
    role: 'volunteer'
  },
  {
    name: 'Ермек Каленов',
    avatar: '',
    bio: 'Профессиональный выгул собаков из Караганды. Занимаюсь этим более 7 лет, имею лицензию и все необходимое оборудование. Регулярно участвую в спасательных операциях по всей Казахстану.',
    skills: ['выгул собак', 'спасение животных', 'кинология', 'работа с животными', 'поисково-спасательные работы'],
    role: 'volunteer'
  },
  {
    name: 'Айнура Токтарова',
    avatar: '',
    bio: 'Мастер по ремонту компьютерной техники из Павлодара. Бесплатно помогаю пожилым людям настраивать компьютеры, смартфоны и другую электронику. Имею сертификаты HP и Lenovo.',
    skills: ['ремонт техники', 'IT-поддержка', 'компьютеры', 'смартфоны', 'помощь пожилым', 'электроника'],
    role: 'volunteer'
  },
  {
    name: 'Мадина Абилова',
    avatar: '',
    bio: 'Профессиональный фотограф из Астаны. Специализируюсь на свадебной и семейной фотографии. Люблю фотографировать природу и городские пейзажи для городского фотопроекта "Алматы - Город Света".',
    skills: ['фотография', 'свадебная фотография', 'семейная фотография', 'природа', 'городской пейзаж', 'Adobe Photoshop', 'Lightroom'],
    role: 'volunteer'
  },
  {
    name: 'Нурлан Бекетов',
    avatar: '',
    bio: 'Преподаватель английского языка из Костаная. Подготовляю школьников к международным экзаменам и олимпиадам. Бесплатно веду онлайн-курсы для детей из малообеспеченных семей.',
    skills: ['преподавание', 'английский язык', 'образование', 'онлайн-обучение', 'менторство', 'олимпиады', 'экзамены'],
    role: 'volunteer'
  },
  {
    name: 'Самат Рахметов',
    avatar: '',
    bio: 'Специалист по кибербезопасности из Атырау. Консультирую по вопросам цифровой гигиены и защиты персональных данных. Провожу тренинги по основам кибербезопасности для студентов.',
    skills: ['кибербезопасность', 'IT', 'консультирование', 'цифровая гигиена', 'защита данных', 'тренинги'],
    role: 'volunteer'
  },
  {
    name: 'Жансая Кадырова',
    avatar: '',
    bio: 'Эколог и активистка из Уральска. Организую субботники по уборке городских парков, посадке деревьев и раздельному сбору мусора. Координирую волонтерские группы на экологические акции.',
    skills: ['экология', 'субботники', 'уборка', 'посадка деревьев', 'раздельный сбор мусора', 'координация волонтеров'],
    role: 'volunteer'
  },
  {
    name: 'Аслан Нурмухамбетов',
    avatar: '',
    bio: 'Бариста из Шымкента с кофейным опытом 4 года. Обучаю людей правильному приготовлению кофе и основам кофейной культуры. Проводу дегустации и мастер-классы.',
    skills: ['кофе', 'бариста', 'кофейная культура', 'обучение', 'дегустация', 'мастер-классы'],
    role: 'volunteer'
  },
  {
    name: 'Карина Смагулова',
    avatar: '',
    bio: 'Психолог из Алматы. Оказываю бесплатную психологическую поддержку студентам и волонтерам. Специализируюсь на стресс-менеджмент и профилактике выгорания.',
    skills: ['психология', 'консультирование', 'поддержка', 'стресс-менеджмент', 'профилактика выгорания', 'ментальное здоровье'],
    role: 'volunteer'
  }
];

// ===== KAZAKHSTAN TASKS =====
const kazakhstanTasks = [
  {
    title: 'Субботник в парке Абай',
    description: 'Помощь в уборке и благоустройстве парка имени Абая в Алматы. Сбор листьев, покраска скамеек, уборка мусора. Необходимы рабочие перчатки и удобная одежда.',
    skills: ['уборка', 'благоустройство', 'работа на свежем воздухе', 'парковое хозяйство'],
    location: 'Парк Абая, Алматы',
    urgency: 'medium',
    creatorId: 'org1'
  },
  {
    title: 'Помощь приюту Аяулым',
    description: 'Ежедневная помощь в приюте для бездомных животных Аяулым. Кормление, уборка вольеров, прогулка собак, помощь ветеринарному врачу. Требуется ответственность и любовь к животным.',
    skills: ['помощь животным', 'уход за животными', 'уборка', 'кормление', 'выгул собак'],
    location: 'Приют Аяулым, Алматинская область',
    urgency: 'high',
    creatorId: 'org1'
  },
  {
    title: 'Урок цифровой грамотности для пенсионеров',
    description: 'Обучение пенсионеров основам работы с компьютером, смартфоном и интернетом. Создание и настройка электронной почты, использование социальных сетей, видеосвязь с родственниками. Занятия 2 раза в неделю в библиотеке.',
    skills: ['образование', 'IT', 'работа с пожилыми', 'цифровая грамотность', 'компьютеры', 'смартфоны', 'социальные сети'],
    location: 'Центральная библиотека, Костанай',
    urgency: 'low',
    creatorId: 'org1'
  },
  {
    title: 'Роспись мурал в центре города',
    description: 'Создание мурала на тему "Казахстан - страна будущего". Художественное оформление стены молодёжного центра в Караганде. Приветствуются художники и дизайнеры с опытом.',
    skills: ['живопись', 'дизайн', 'роспись стен', 'художественное оформление', 'творчество'],
    location: 'Молодёжный центр, Караганда',
    urgency: 'medium',
    creatorId: 'org1'
  },
  {
    title: 'Сбор гуманитарной помощи для пострадавших',
    description: 'Сбор и сортировка гуманитарной помощи (одежда, продукты, предметы первой необходимости) для семей, пострадавших от наводнения в Туркестанской области. Требуется физическая сила для погрузочно-разгрузочных работ.',
    skills: ['сбор помощи', 'сортировка', 'гуманитарная помощь', 'физическая работа', 'логистика'],
    location: 'Склад в Туркестане',
    urgency: 'high',
    creatorId: 'org1'
  }
];

// ===== MOCK EMBEDDINGS =====
const mockEmbeddings: Record<string, number[]> = {
  'SMM': [0.1, 0.2, 0.3, 0.4, 0.5],
  'цифровой маркетинг': [0.1, 0.2, 0.3, 0.4, 0.5],
  'живопись': [0.6, 0.7, 0.8, 0.9],
  'декорирование': [0.6, 0.7, 0.8, 0.9],
  'помощь животным': [0.8, 0.9, 0.7, 0.6],
  'ветеринария': [0.8, 0.9, 0.7, 0.6],
  'выгул собак': [0.9, 0.8, 0.7, 0.6],
  'преподавание': [0.7, 0.8, 0.9, 0.6],
  'образование': [0.7, 0.8, 0.9, 0.6],
  'кибербезопасность': [0.8, 0.9, 0.7, 0.6],
  'экология': [0.9, 0.8, 0.7, 0.6],
  'уборка': [0.7, 0.8, 0.9, 0.6],
  'ремонт техники': [0.6, 0.7, 0.8, 0.9],
  'фотография': [0.7, 0.8, 0.9, 0.6],
  'кофе': [0.5, 0.6, 0.7, 0.8],
  'психология': [0.8, 0.9, 0.7, 0.6],
};

// ===== HELPER FUNCTIONS =====
function generateMockEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(' ');
  const embedding = new Array(1536).fill(0);
  
  words.forEach((word: string, wordIndex: number) => {
    if (mockEmbeddings[word]) {
      mockEmbeddings[word].forEach((val: number, valIndex: number) => {
        if (valIndex < 1536) {
          embedding[valIndex] = val;
        }
      });
    }
  });
  
  return embedding;
}

// ===== SEEDING FUNCTIONS =====
async function seedVolunteers() {
  console.log('🌍 Seeding Kazakhstan volunteers...');
  
  try {
    for (const volunteer of kazakhstanVolunteers) {
      // Generate embedding for skills
      const skillsText = volunteer.skills.join(' ');
      const embedding = generateMockEmbedding(skillsText);
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: volunteer.name.toLowerCase().replace(/\s+/g, '-'),
          name: volunteer.name,
          avatar: volunteer.avatar,
          skills: volunteer.skills,
          bio: volunteer.bio,
          role: volunteer.role,
          embedding: embedding,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error(`❌ Error seeding volunteer ${volunteer.name}:`, error);
      } else {
        console.log(`✅ Seeded volunteer: ${volunteer.name}`);
      }
    }
    
    console.log('🎉 Successfully seeded volunteers!');
  } catch (error) {
    console.error('❌ Error seeding volunteers:', error);
  }
}

async function seedTasks() {
  console.log('📋 Seeding Kazakhstan tasks...');
  
  try {
    for (const task of kazakhstanTasks) {
      // Generate embedding for task description
      const taskText = `${task.title} ${task.description} ${task.skills.join(' ')}`;
      const embedding = generateMockEmbedding(taskText);
      
      const { data, error } = await supabase
        .from('tasks')
        .upsert({
          id: task.title.toLowerCase().replace(/\s+/g, '-'),
          title: task.title,
          description: task.description,
          skills: task.skills,
          location: task.location,
          urgency: task.urgency,
          status: 'open',
          creatorId: task.creatorId,
          embedding: embedding,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error(`❌ Error seeding task ${task.title}:`, error);
      } else {
        console.log(`✅ Seeded task: ${task.title}`);
      }
    }
    
    console.log('🎉 Successfully seeded tasks!');
  } catch (error) {
    console.error('❌ Error seeding tasks:', error);
  }
}

async function seedApplications() {
  console.log('📝 Seeding approved applications...');
  
  try {
    // Create some approved applications to show success stories
    const approvedApplications = [
      {
        task_id: 'subbotnik-v-parke-abaya',
        volunteer_id: 'aigerim-mamedov',
        status: 'approved',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        task_id: 'pomoshch-priyutu-ayulym',
        volunteer_id: 'baurzhan-ospnov',
        status: 'approved',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        task_id: 'urok-tsifrovoy-gramotnosti',
        volunteer_id: 'nurlan-beketov',
        status: 'approved',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const app of approvedApplications) {
      const { data, error } = await supabase
        .from('applications')
        .upsert(app)
        .select();

      if (error) {
        console.error(`❌ Error seeding application:`, error);
      } else {
        console.log(`✅ Seeded approved application for task: ${app.task_id}`);
      }
    }
    
    console.log('🎉 Successfully seeded approved applications!');
  } catch (error) {
    console.error('❌ Error seeding applications:', error);
  }
}

// ===== MAIN SEED FUNCTION =====
async function seedDatabase() {
  console.log('🚀 Starting Kazakhstan database seeding...');
  
  // Check environment variables
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
    return;
  }
  
  // Clear existing data (optional)
  console.log('🧹 Cleaning existing data...');
  await supabase.from('profiles').delete().neq('id', '');
  await supabase.from('tasks').delete().neq('id', '');
  await supabase.from('applications').delete().neq('id', '');
  
  // Seed new data
  await seedVolunteers();
  await seedTasks();
  await seedApplications();
  
  console.log('� Database seeding completed!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   👥 Volunteers: ${kazakhstanVolunteers.length}`);
  console.log(`   📋 Tasks: ${kazakhstanTasks.length}`);
  console.log(`   ✅ Approved Applications: 3`);
  console.log('');
  console.log('🌍 Kazakhstan volunteer platform is ready!');
}

// ===== RUN SEEDING =====
if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { seedDatabase, kazakhstanVolunteers, kazakhstanTasks };
