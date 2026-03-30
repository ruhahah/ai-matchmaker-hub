// ===== TYPES =====

export interface Task {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  status: 'open' | 'verifying' | 'completed';
  creatorId: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  bio: string;
  role: 'volunteer' | 'organizer';
}

export interface MatchingResult {
  volunteerId: string;
  taskId: string;
  score: number;
  reason: string;
}

export interface IntakeResult {
  title: string;
  description: string;
  skills: string[];
  urgency: 'low' | 'medium' | 'high';
}

export interface VisionResult {
  status: 'approved' | 'rejected';
  confidence: number;
  reason: string;
}

// ===== MOCK DATA =====

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Paint community fence', description: 'The fence along Oak Street needs fresh paint. Supplies provided.', skills: ['painting', 'outdoors'], location: 'Oak Street Park', status: 'open', creatorId: 'org1' },
  { id: 't2', title: 'Dog shelter weekend helper', description: 'Help walk and feed dogs at the local shelter on Saturday mornings.', skills: ['animals', 'caregiving'], location: 'Sunshine Animal Shelter', status: 'open', creatorId: 'org1' },
  { id: 't3', title: 'Tutoring for teens', description: 'Provide math and science tutoring for high-school students after school.', skills: ['teaching', 'math', 'science'], location: 'Downtown Library', status: 'verifying', creatorId: 'org1' },
  { id: 't4', title: 'Community garden cleanup', description: 'Spring cleaning at the community garden. Weeding, planting, mulching.', skills: ['gardening', 'outdoors'], location: 'Elm Avenue Garden', status: 'open', creatorId: 'org1' },
  { id: 't5', title: 'Senior tech assistance', description: 'Help senior citizens at the community center learn to use smartphones and tablets.', skills: ['technology', 'patience', 'teaching'], location: 'Golden Years Center', status: 'completed', creatorId: 'org1' },
];

const MOCK_PROFILES: Profile[] = [
  { id: 'v1', name: 'Alex Rivera', avatar: '', skills: ['painting', 'carpentry', 'outdoors'], bio: 'Experienced handyman who loves outdoor projects. 5 years of volunteer painting experience.', role: 'volunteer' },
  { id: 'v2', name: 'Jordan Lee', avatar: '', skills: ['animals', 'caregiving', 'first-aid'], bio: 'Animal lover and certified first-aid responder. Weekend availability.', role: 'volunteer' },
  { id: 'v3', name: 'Sam Patel', avatar: '', skills: ['teaching', 'math', 'science', 'technology'], bio: 'Engineering student passionate about education and STEM outreach.', role: 'volunteer' },
  { id: 'v4', name: 'Casey Morgan', avatar: '', skills: ['gardening', 'outdoors', 'photography'], bio: 'Green thumb with a camera. Loves documenting community transformations.', role: 'volunteer' },
];

const AI_REASONS = [
  "Skills 'painting' and 'teamwork' closely match task requirements",
  "Bio mentions extensive experience with animals and caregiving",
  "Teaching background and subject expertise align perfectly",
  "Outdoor project experience and availability match well",
  "Technical skills and patience trait are ideal for this task",
];

// ===== MOCK FUNCTIONS =====

export async function getTasks(_role: string): Promise<Task[]> {
  await delay(600);
  return [...MOCK_TASKS];
}

export async function getProfiles(_role: string): Promise<Profile[]> {
  await delay(400);
  return [...MOCK_PROFILES];
}

export async function aiIntakeText(rawText: string): Promise<IntakeResult> {
  const { supabase } = await import('@/integrations/supabase/client');

  const { data, error } = await supabase.functions.invoke('ai-intake', {
    body: { rawText },
  });

  if (error) {
    console.error('AI intake error:', error);
    throw new Error(error.message || 'AI processing failed');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    title: data.title,
    description: data.description,
    skills: data.skills,
    urgency: data.urgency,
  };
}

export async function aiSemanticMatching(taskId: string, profileIds: string[]): Promise<MatchingResult[]> {
  await delay(1200);
  return profileIds.map((vid, i) => ({
    volunteerId: vid,
    taskId,
    score: parseFloat((0.8 + Math.random() * 0.19).toFixed(2)),
    reason: AI_REASONS[i % AI_REASONS.length],
  })).sort((a, b) => b.score - a.score);
}

export async function aiVisionVerify(_taskId: string, _photoBase64: string): Promise<VisionResult> {
  await delay(2200);
  const approved = Math.random() > 0.25;
  return {
    status: approved ? 'approved' : 'rejected',
    confidence: parseFloat((0.85 + Math.random() * 0.14).toFixed(2)),
    reason: approved
      ? 'Image shows completed work matching the task description. Quality assessment: satisfactory.'
      : 'Unable to verify completion. The submitted image does not clearly show the expected deliverable.',
  };
}
