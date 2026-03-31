// OpenAI API integration with structured outputs and embeddings

interface OpenAIConfig {
  apiKey: string;
  baseUrl: string;
}

const config: OpenAIConfig = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  baseUrl: 'https://api.openai.com/v1'
};

// Structured output schema for task intake
const taskIntakeSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "A clear, concise title for the volunteer task"
    },
    description: {
      type: "string", 
      description: "A detailed description of what needs to be done"
    },
    category: {
      type: "string",
      description: "The category of work (e.g., 'education', 'environment', 'animals', 'community')"
    },
    skills: {
      type: "array",
      items: { type: "string" },
      description: "Required skills for this task"
    },
    urgency: {
      type: "string",
      enum: ["low", "medium", "high"],
      description: "How urgent this task is"
    }
  },
  required: ["title", "description", "skills", "urgency"]
};

// Generate structured task data from raw text using GPT-4o
export async function aiIntakeText(rawText: string): Promise<{
  title: string;
  description: string;
  skills: string[];
  urgency: 'low' | 'medium' | 'high';
}> {
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that extracts structured information from volunteer task descriptions. 
            Extract the key details and format them according to the schema. Be helpful and accurate.`
          },
          {
            role: 'user',
            content: `Extract task information from this text: "${rawText}"`
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'task_intake',
            schema: taskIntakeSchema
          }
        },
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      title: result.title,
      description: result.description,
      skills: result.skills || [],
      urgency: result.urgency || 'medium'
    };
  } catch (error) {
    console.error('AI intake error:', error);
    throw new Error(`Failed to process text with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate embedding using text-embedding-3-small
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch(`${config.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.replace(/\n/g, ' ').trim(),
        encoding_format: 'float',
        dimensions: 1536
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI embedding error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// AI vision verification for task completion
export async function aiVisionVerify(
  photoBase64: string,
  taskDescription: string,
  taskTitle: string
): Promise<{
  status: 'approved' | 'rejected';
  confidence: number;
  reason: string;
}> {
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Ты AI-эксперт по верификации выполнения волонтерских задач. 
            Твоя задача - проанализировать фото и определить, подтверждает ли оно выполнение задачи.
            Будь строгим, но справедливым. Фото должно четко показывать выполнение конкретной задачи.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Проверь, подтверждает ли это фото выполнение задачи: "${taskTitle}" - ${taskDescription}. 
                
                Если да - верни approved. Если нет или фото не по теме/нечеткое - rejected и укажи причину.
                
                Оцени уверенность от 0.0 до 1.0 и дай краткое объяснение.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${photoBase64}`,
                },
              },
            ],
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'vision_verification',
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['approved', 'rejected'],
                  description: 'Approved if photo confirms task completion, rejected otherwise'
                },
                confidence: {
                  type: 'number',
                  minimum: 0.0,
                  maximum: 1.0,
                  description: 'Confidence level of the decision'
                },
                reason: {
                  type: 'string',
                  description: 'Brief explanation of the decision in Russian'
                }
              },
              required: ['status', 'confidence', 'reason']
            }
          }
        },
        temperature: 0.3,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI Vision API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      status: result.status,
      confidence: result.confidence,
      reason: result.reason
    };
  } catch (error) {
    console.error('Vision verification error:', error);
    return {
      status: 'rejected',
      confidence: 0.0,
      reason: 'Не удалось проанализировать фото. Пожалуйста, попробуйте еще раз.'
    };
  }
}

// Generate AI explanation for why a volunteer matches a task
export async function generateMatchExplanation(
  volunteerBio: string,
  volunteerSkills: string[],
  taskDescription: string,
  taskSkills: string[]
): Promise<string> {
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты AI-ассистент для волонтерской платформы. Создай краткое, убедительное объяснение на русском языке о том, почему волонтер подходит для задачи.'
          },
          {
            role: 'user',
            content: `Волонтер: навыки - ${volunteerSkills.join(', ')}, био - "${volunteerBio}"
            
Задача: требуется навыки - ${taskSkills.join(', ')}, описание - "${taskDescription}"

В одном коротком предложении объясни, почему этот волонтер идеально подходит для этой задачи. Фокусируйся на совпадении навыков или личных качеств.`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Explanation generation error:', error);
    return 'Идеальное совпадение навыков и опыта для этой задачи.';
  }
}

// Create task with embedding and find matching volunteers
export async function createTaskWithMatching(taskData: {
  title: string;
  description: string;
  skills: string[];
  location?: string;
  urgency: 'low' | 'medium' | 'high';
  creatorId: string;
}) {
  try {
    // Import Supabase client
    const { supabase, updateTaskEmbedding, matchVolunteers, createApplication } = await import('./supabase');
    
    // Generate embedding for the task
    const embeddingText = `${taskData.title} ${taskData.description} ${taskData.skills.join(' ')}`;
    const embedding = await generateEmbedding(embeddingText);
    
    // Create the task first
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        creator_id: taskData.creatorId,
        title: taskData.title,
        description: taskData.description,
        skills: taskData.skills,
        location: taskData.location,
        urgency: taskData.urgency,
        status: 'open'
      })
      .select()
      .single();

    if (taskError) throw taskError;
    
    // Update the task with embedding
    await updateTaskEmbedding(task.id, embedding);
    
    // Find matching volunteers
    const matches = await matchVolunteers(embedding, 10, 0.5);
    
    // Generate explanations and create applications for top matches
    const applicationsWithExplanations = await Promise.all(
      matches.slice(0, 5).map(async (match) => {
        const explanation = await generateMatchExplanation(
          match.volunteer_bio || '',
          match.volunteer_skills || [],
          taskData.description,
          taskData.skills
        );
        
        return {
          task_id: task.id,
          volunteer_id: match.volunteer_id,
          ai_score: match.similarity_score,
          ai_reason: explanation,
          status: 'pending' as const
        };
      })
    );
    
    // Create applications in database
    if (applicationsWithExplanations.length > 0) {
      await Promise.all(
        applicationsWithExplanations.map(app => createApplication(app))
      );
    }
    
    return {
      task,
      matches: matches.map((match, index) => ({
        ...match,
        ai_reason: applicationsWithExplanations[index]?.ai_reason || 'Отличное совпадение навыков'
      }))
    };
  } catch (error) {
    console.error('Create task with matching error:', error);
    throw error;
  }
}

// Update profile with embedding
export async function updateProfileWithEmbedding(profileId: string, profileData: {
  name?: string;
  bio?: string;
  skills?: string[];
}) {
  try {
    const { supabase, updateProfileEmbedding } = await import('./supabase');
    
    // Update profile data
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', profileId)
      .select()
      .single();

    if (updateError) throw updateError;
    
    // Generate embedding for the profile
    const embeddingText = `${profile.name} ${profile.bio || ''} ${profile.skills.join(' ')}`;
    const embedding = await generateEmbedding(embeddingText);
    
    // Update profile with embedding
    await updateProfileEmbedding(profileId, embedding);
    
    return profile;
  } catch (error) {
    console.error('Update profile with embedding error:', error);
    throw error;
  }
}
