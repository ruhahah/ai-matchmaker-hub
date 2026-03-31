import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://vnghhecncidqeuoiadpq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ===== DEMO GOD FUNCTIONS =====

// Function to simulate volunteer applications
async function simulateApplications() {
  console.log('🎭 Demo God: Simulating volunteer applications...');
  
  const mockApplications = [
    {
      task_id: 'eco-cleanup-badam',
      volunteer_id: 'gulnara-sultanova',
      status: 'pending',
      created_at: new Date().toISOString()
    },
    {
      task_id: 'eco-cleanup-badam',
      volunteer_id: 'baurzhan-ospov',
      status: 'pending', 
      created_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    },
    {
      task_id: 'eco-cleanup-badam',
      volunteer_id: 'nurlan-beketov',
      status: 'pending',
      created_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    }
  ];

  for (const app of mockApplications) {
    const { data, error } = await supabase
      .from('applications')
      .upsert(app)
      .select();

    if (error) {
      console.error(`❌ Error simulating application:`, error);
    } else {
      console.log(`✅ Simulated application: ${app.volunteer_id} -> ${app.task_id}`);
    }
  }
}

// Function to create demo task
async function createDemoTask() {
  console.log('🎭 Demo God: Creating eco cleanup task...');
  
  const demoTask = {
    id: 'eco-cleanup-badam',
    title: 'Экологическая акция: Чистый Бадам',
    description: 'Нужны волонтеры для очистки берега реки Бадам в это воскресенье. Сбор мусора, посадка деревьев, экологическое просвещение местных жителей.',
    skills: ['экология', 'уборка', 'работа на свежем воздухе', 'просвещение'],
    location: 'Берег реки Бадам, Алматы',
    urgency: 'high',
    creatorId: 'org1'
  };

  const { data, error } = await supabase
    .from('tasks')
    .upsert(demoTask)
    .select();

  if (error) {
    console.error('❌ Error creating demo task:', error);
  } else {
    console.log('✅ Demo eco task created successfully');
    // Trigger matching simulation
    await simulateApplications();
  }
}

// Function to add demo volunteer
async function addDemoVolunteer() {
  console.log('🎭 Demo God: Adding demo volunteer...');
  
  const demoVolunteer = {
    id: 'demo-volunteer-god',
    name: 'Демо Волонтер',
    avatar: '',
    bio: 'Создан демонстрацией для показа магии платформы. Умею мгновенно находить идеальные задачи!',
    skills: ['демонстрация', 'магия', 'волонтерство'],
    role: 'volunteer'
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(demoVolunteer)
    .select();

  if (error) {
    console.error('❌ Error adding demo volunteer:', error);
  } else {
    console.log('✅ Demo volunteer added successfully');
  }
}

// Function to show demo notification
async function showDemoNotification(message: string, type: 'success' | 'info' | 'magic' = 'info') {
  const notification = {
    id: `demo-${Date.now()}`,
    message,
    type,
    created_at: new Date().toISOString(),
    read: false
  };

  const { data, error } = await supabase
    .from('demo_notifications')
    .insert(notification)
    .select();

  if (error) {
    console.error('❌ Error creating notification:', error);
  } else {
    console.log(`✅ Demo notification: ${message}`);
  }
}

// ===== MAIN DEMO FUNCTIONS =====
async function demoGodMode() {
  console.log('🎭 Demo God: Activating interactive magic...');
  
  // Create demo task first
  await createDemoTask();
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Show magic notification
  await showDemoNotification(
    '✨ AI нашел идеальный матч для задачи по озеленению!',
    'magic'
  );
  
  // Wait more
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Add more volunteers to the task
  await simulateApplications();
  
  await showDemoNotification(
    '🎉 3 волонтера откликнулись на задачу за 30 секунд!',
    'success'
  );
}

// Export individual functions
export { 
  simulateApplications, 
  createDemoTask, 
  addDemoVolunteer, 
  showDemoNotification, 
  demoGodMode
};
