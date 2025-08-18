export interface EventType {
  id: string;
  title: string;
  description: string;
  type: 'hackathon' | 'conference' | 'meetup' | 'fest';
  mode: 'online' | 'offline' | 'hybrid';
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  bannerUrl?: string;
  maxParticipants?: number;
  registrationStartAt: string;
  registrationEndAt: string;
  startAt: string;
  endAt: string;
  venue?: string;
  organizationId: string;
  createdById: string;
  metadata?: any;
  createdAt: string;
}

export interface TeamType {
  id: string;
  name: string;
  description?: string;
  eventId: string;
  leaderId: string;
  maxMembers: number;
  inviteCode?: string;
  createdAt: string;
  members?: TeamMemberType[];
}

export interface TeamMemberType {
  id: string;
  teamId: string;
  userId: string;
  role: 'leader' | 'member';
  joinedAt: string;
  user?: UserType;
}

export interface UserType {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  university?: string;
  role: 'participant' | 'organizer' | 'admin';
  avatarUrl?: string;
  isVerified: boolean;
  globalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface BadgeType {
  id: string;
  userId: string;
  eventId?: string;
  type: 'winner' | 'participant' | 'achievement' | 'special';
  name: string;
  description?: string;
  iconUrl?: string;
  metadata?: any;
  awardedAt: string;
}

export interface SubmissionType {
  id: string;
  eventId: string;
  roundId: string;
  teamId: string;
  submittedById: string;
  content: any;
  attachments?: any;
  status: 'pending' | 'submitted' | 'evaluated';
  submittedAt: string;
}

export interface AnnouncementType {
  id: string;
  eventId: string;
  authorId: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

export interface ActivityFeedItem {
  id: string;
  type: 'submission' | 'registration' | 'achievement' | 'event_created' | 'team_formed';
  userId: string;
  eventId?: string;
  teamId?: string;
  description: string;
  createdAt: string;
  user?: UserType;
  event?: EventType;
  team?: TeamType;
}

export interface LeaderboardEntry {
  rank: number;
  user: UserType;
  points: number;
  badgeCount: number;
  eventCount: number;
}

export interface DashboardStats {
  user: UserType;
  events: EventType[];
  teams: TeamType[];
  badges: BadgeType[];
  rank: number;
  connections: UserType[];
  recentActivity: ActivityFeedItem[];
}

export interface EventRoundType {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  roundNumber: number;
  startAt: string;
  endAt: string;
  maxScore: number;
  submissionFormSchema?: any;
  isActive: boolean;
  createdAt: string;
}

export interface OrganizationType {
  id: string;
  name: string;
  handle: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  website?: string;
  isVerified: boolean;
  createdById: string;
  createdAt: string;
}

export interface WebSocketMessage {
  type: 'new_event' | 'new_registration' | 'new_submission' | 'leaderboard_update' | 'announcement';
  data: any;
  timestamp: string;
}

export interface CreateEventForm {
  title: string;
  description: string;
  type: 'hackathon' | 'conference' | 'meetup' | 'fest';
  mode: 'online' | 'offline' | 'hybrid';
  maxParticipants?: number;
  registrationStartAt: string;
  registrationEndAt: string;
  startAt: string;
  endAt: string;
  venue?: string;
  bannerUrl?: string;
  organizationId: string;
  rounds?: Array<{
    name: string;
    description?: string;
    startAt: string;
    endAt: string;
    maxScore: number;
  }>;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  university?: string;
  role: 'participant' | 'organizer';
}
