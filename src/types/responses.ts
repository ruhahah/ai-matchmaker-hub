export interface Response {
  id: string;
  taskId: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerAvatar?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  message: string;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // organizerId
  reviewMessage?: string;
  matchingScore?: number;
  hardSkills: string[];
  softSkills: string[];
  experience: string;
  availability: string;
  motivation: string;
}

export interface ResponseStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
}

export interface ResponseFilters {
  status: 'all' | 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  skills: string[];
  experience: 'all' | 'beginner' | 'intermediate' | 'expert';
  availability: 'all' | 'immediate' | 'flexible' | 'weekends';
}

export interface ResponseNotification {
  id: string;
  type: 'new_response' | 'response_accepted' | 'response_rejected' | 'response_withdrawn' | 'task_assigned' | 'task_completed' | 'new_task_available';
  taskId: string;
  taskTitle: string;
  volunteerId?: string;
  volunteerName?: string;
  organizerId?: string;
  recipientId: string; // ID получателя уведомления
  recipientRole: 'organizer' | 'volunteer'; // Роль получателя
  message: string;
  createdAt: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string; // URL для перехода при клике
}
