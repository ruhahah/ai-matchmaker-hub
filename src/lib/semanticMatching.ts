import { generateEmbedding } from './ai-service';
import { demoDatabase } from './demoDatabase';

// Вычисление косинусного сходства между векторами
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must be of same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Создание эмбеддинга для задачи
export async function createTaskEmbedding(task: any): Promise<number[]> {
  const taskText = `
    Название: ${task.title}
    Описание: ${task.description}
    Навыки: ${(task.skills || []).join(', ')}
    Локация: ${task.location || ''}
    Срочность: ${task.urgency || ''}
  `.trim();

  return await generateEmbedding(taskText);
}

// Создание эмбеддинга для профиля волонтера
export async function createVolunteerEmbedding(volunteer: any): Promise<number[]> {
  const volunteerText = `
    Имя: ${volunteer.name}
    Био: ${volunteer.bio || ''}
    Навыки: ${(volunteer.skills || []).join(', ')}
    Локация: ${volunteer.location || ''}
    Опыт: ${volunteer.stats?.tasksCompleted || 0} выполненных задач
    Рейтинг: ${volunteer.stats?.rating || 0}
  `.trim();

  return await generateEmbedding(volunteerText);
}

// Истинный семантический мэтчинг через векторы
export async function trueSemanticMatching(taskId: string): Promise<any[]> {
  try {
    const tasks = demoDatabase.getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.warn('Task not found:', taskId);
      return [];
    }

    const profiles = demoDatabase.getProfiles();
    const volunteers = profiles.filter(p => p.role === 'volunteer');

    // Создаем эмбеддинг для задачи
    const taskEmbedding = await createTaskEmbedding(task);

    // Создаем эмбеддинги для волонтеров и считаем сходство
    const matches = await Promise.all(
      volunteers.map(async (volunteer) => {
        const volunteerEmbedding = await createVolunteerEmbedding(volunteer);
        const similarity = cosineSimilarity(taskEmbedding, volunteerEmbedding);

        return {
          volunteerId: volunteer.id,
          volunteerName: volunteer.name,
          volunteerSkills: volunteer.skills,
          volunteerBio: volunteer.bio || '',
          taskId,
          score: similarity,
          reason: await generateExplainableReason(task, volunteer, similarity)
        };
      })
    );

    // Сортируем по сходству и возвращаем топ-10
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

  } catch (error) {
    console.error('True semantic matching error:', error);
    return [];
  }
}

// Генерация объяснимой причины через GPT-4
async function generateExplainableReason(task: any, volunteer: any, similarity: number): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Ты - AI-аналитик. На основе сходства задач и волонтеров генерируй краткое объяснение почему этот кандидат подходит. Сходство: ${similarity.toFixed(3)} (0-1). Отвечай на русском языке в 1-2 предложениях.`
          },
          {
            role: 'user',
            content: `
            ЗАДАЧА:
            Название: ${task.title}
            Описание: ${task.description}
            Навыки: ${(task.skills || []).join(', ')}
            
            ВОЛОНТЕР:
            Имя: ${volunteer.name}
            Навыки: ${(volunteer.skills || []).join(', ')}
            Био: ${volunteer.bio || ''}
            Опыт: ${volunteer.stats?.tasksCompleted || 0} задач
            
            Сгенерируй объяснение почему рекомендуем этого кандидата:
            `
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate explanation');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Хороший кандидат для этой задачи';

  } catch (error) {
    console.error('Explanation generation error:', error);
    return `Сходство с задачей: ${(similarity * 100).toFixed(1)}%`;
  }
}
