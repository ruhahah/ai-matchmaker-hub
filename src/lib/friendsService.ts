import { localStorageDB } from './useLocalStorage';

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  bio: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  toUserName: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface TeamInvitation {
  id: string;
  taskId: string;
  taskTitle: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export class FriendsService {
  private static instance: FriendsService;
  
  static getInstance(): FriendsService {
    if (!FriendsService.instance) {
      FriendsService.instance = new FriendsService();
    }
    return FriendsService.instance;
  }

  // Get friends for current user
  getFriends(userId: string): Friend[] {
    const profiles = localStorageDB.getProfiles('volunteer');
    const currentProfile = localStorageDB.getProfile(userId);
    
    if (!currentProfile) return [];
    
    // For demo, return all other volunteers as "friends"
    // In real app, this would check actual friendships
    return profiles
      .filter(p => p.id !== userId && p.role === 'volunteer')
      .map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + p.name,
        skills: p.skills || [],
        bio: p.bio || '',
        status: Math.random() > 0.5 ? 'online' : 'offline' as 'online' | 'offline',
        lastSeen: new Date().toISOString()
      }));
  }

  // Get friend requests
  getFriendRequests(userId: string): FriendRequest[] {
    const requests = this.getTable('friendRequests') as FriendRequest[];
    return requests.filter((req: FriendRequest) => 
      (req.toUserId === userId || req.fromUserId === userId) && 
      req.status === 'pending'
    );
  }

  // Send friend request
  sendFriendRequest(fromUserId: string, toUserId: string): FriendRequest {
    const requests = this.getTable('friendRequests') as FriendRequest[];
    const fromUser = localStorageDB.getProfile(fromUserId);
    const toUser = localStorageDB.getProfile(toUserId);
    
    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }

    const newRequest: FriendRequest = {
      id: this.generateId(),
      fromUserId,
      toUserId,
      fromUserName: fromUser.name,
      toUserName: toUser.name,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    requests.push(newRequest);
    this.setTable('friendRequests', requests);
    return newRequest;
  }

  // Accept friend request
  acceptFriendRequest(requestId: string): void {
    const requests = this.getTable('friendRequests') as FriendRequest[];
    const index = requests.findIndex((req: FriendRequest) => req.id === requestId);
    
    if (index !== -1) {
      requests[index].status = 'accepted';
      this.setTable('friendRequests', requests);
    }
  }

  // Reject friend request
  rejectFriendRequest(requestId: string): void {
    const requests = this.getTable('friendRequests') as FriendRequest[];
    const index = requests.findIndex((req: FriendRequest) => req.id === requestId);
    
    if (index !== -1) {
      requests[index].status = 'rejected';
      this.setTable('friendRequests', requests);
    }
  }

  // Send team invitation
  sendTeamInvitation(
    fromUserId: string, 
    toUserId: string, 
    taskId: string, 
    taskTitle: string, 
    message: string
  ): TeamInvitation {
    const invitations = this.getTable('teamInvitations') as TeamInvitation[];
    const fromUser = localStorageDB.getProfile(fromUserId);
    const toUser = localStorageDB.getProfile(toUserId);
    
    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }

    const newInvitation: TeamInvitation = {
      id: this.generateId(),
      taskId,
      taskTitle,
      fromUserId,
      fromUserName: fromUser.name,
      toUserId,
      toUserName: toUser.name,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    invitations.push(newInvitation);
    this.setTable('teamInvitations', invitations);
    return newInvitation;
  }

  // Get team invitations for user
  getTeamInvitations(userId: string): TeamInvitation[] {
    const invitations = this.getTable('teamInvitations') as TeamInvitation[];
    return invitations.filter((inv: TeamInvitation) => 
      inv.toUserId === userId && inv.status === 'pending'
    );
  }

  // Accept team invitation
  acceptTeamInvitation(invitationId: string): void {
    const invitations = this.getTable('teamInvitations') as TeamInvitation[];
    const index = invitations.findIndex((inv: TeamInvitation) => inv.id === invitationId);
    
    if (index !== -1) {
      invitations[index].status = 'accepted';
      this.setTable('teamInvitations', invitations);
    }
  }

  // Reject team invitation
  rejectTeamInvitation(invitationId: string): void {
    const invitations = this.getTable('teamInvitations') as TeamInvitation[];
    const index = invitations.findIndex((inv: TeamInvitation) => inv.id === invitationId);
    
    if (index !== -1) {
      invitations[index].status = 'rejected';
      this.setTable('teamInvitations', invitations);
    }
  }

  // Helper methods
  private getTable<T>(tableName: string): T[] {
    try {
      const data = localStorage.getItem(tableName);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setTable<T>(tableName: string, data: T[]): void {
    localStorage.setItem(tableName, JSON.stringify(data));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Initialize demo data
  initializeDemoData(): void {
    if (this.getTable('friendRequests').length === 0) {
      this.setTable('friendRequests', []);
      this.setTable('teamInvitations', []);
    }
  }
}

export const friendsService = FriendsService.getInstance();
