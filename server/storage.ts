import { 
  users, organizations, events, teams, teamMembers, eventRegistrations, 
  submissions, badges, certificates, announcements, qaThreads, qaReplies,
  eventRounds, evaluations, organizationFollowers, userConnections,
  type User, type InsertUser, type Organization, type InsertOrganization,
  type Event, type InsertEvent, type Team, type InsertTeam,
  type InsertSubmission, type Submission, type EventRound, type TeamMember,
  type Badge, type Certificate
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, count, avg } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: string, points: number): Promise<void>;
  
  // Organization management
  getOrganization(id: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getUserOrganizations(userId: string): Promise<Organization[]>;
  
  // Event management
  getEvent(id: string): Promise<Event | undefined>;
  getUserEvents(userId: string): Promise<Event[]>;
  getOrganizationEvents(orgId: string): Promise<Event[]>;
  getPublicEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Team management
  getTeam(id: string): Promise<Team | undefined>;
  getEventTeams(eventId: string): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  joinTeam(teamId: string, userId: string): Promise<void>;
  getUserTeams(userId: string): Promise<Team[]>;
  
  // Registration management
  registerForEvent(eventId: string, userId: string, teamId?: string): Promise<void>;
  getUserRegistrations(userId: string): Promise<any[]>;
  
  // Submission management
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getTeamSubmissions(teamId: string, roundId: string): Promise<Submission[]>;
  
  // Badge and certificate management
  awardBadge(userId: string, badgeName: string, eventId?: string): Promise<Badge>;
  getUserBadges(userId: string): Promise<Badge[]>;
  generateCertificate(userId: string, eventId: string, type: string): Promise<Certificate>;
  
  // Social features
  followOrganization(userId: string, orgId: string): Promise<void>;
  followUser(followerId: string, followingId: string): Promise<void>;
  getUserConnections(userId: string): Promise<User[]>;
  
  // Leaderboard
  getGlobalLeaderboard(limit?: number): Promise<User[]>;
  getUserRank(userId: string): Promise<number>;
  
  // Activity feed
  getRecentActivity(limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserPoints(userId: string, points: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        globalPoints: sql`${users.globalPoints} + ${points}`,
        updatedAt: sql`now()`
      })
      .where(eq(users.id, userId));
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org || undefined;
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const [org] = await db
      .insert(organizations)
      .values(insertOrg)
      .returning();
    return org;
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    return await db
      .select()
      .from(organizations)
      .where(eq(organizations.createdById, userId));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    return await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        type: events.type,
        mode: events.mode,
        status: events.status,
        bannerUrl: events.bannerUrl,
        maxParticipants: events.maxParticipants,
        registrationStartAt: events.registrationStartAt,
        registrationEndAt: events.registrationEndAt,
        startAt: events.startAt,
        endAt: events.endAt,
        venue: events.venue,
        organizationId: events.organizationId,
        createdById: events.createdById,
        metadata: events.metadata,
        createdAt: events.createdAt
      })
      .from(events)
      .innerJoin(eventRegistrations, eq(events.id, eventRegistrations.eventId))
      .where(eq(eventRegistrations.userId, userId));
  }

  async getOrganizationEvents(orgId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.organizationId, orgId))
      .orderBy(desc(events.createdAt));
  }

  async getPublicEvents(): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.status, 'published'))
      .orderBy(desc(events.createdAt));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async getEventTeams(eventId: string): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .where(eq(teams.eventId, eventId));
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const inviteCode = randomUUID().substring(0, 8).toUpperCase();
    const [team] = await db
      .insert(teams)
      .values({ ...insertTeam, inviteCode })
      .returning();
    
    // Add leader as team member
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: team.leaderId,
      role: 'leader'
    });
    
    return team;
  }

  async joinTeam(teamId: string, userId: string): Promise<void> {
    await db.insert(teamMembers).values({
      teamId,
      userId,
      role: 'member'
    });
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    return await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        eventId: teams.eventId,
        leaderId: teams.leaderId,
        maxMembers: teams.maxMembers,
        inviteCode: teams.inviteCode,
        createdAt: teams.createdAt
      })
      .from(teams)
      .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
      .where(eq(teamMembers.userId, userId));
  }

  async registerForEvent(eventId: string, userId: string, teamId?: string): Promise<void> {
    await db.insert(eventRegistrations).values({
      eventId,
      userId,
      teamId
    });
  }

  async getUserRegistrations(userId: string): Promise<any[]> {
    return await db
      .select({
        event: events,
        registration: eventRegistrations,
        team: teams
      })
      .from(eventRegistrations)
      .innerJoin(events, eq(eventRegistrations.eventId, events.id))
      .leftJoin(teams, eq(eventRegistrations.teamId, teams.id))
      .where(eq(eventRegistrations.userId, userId));
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db
      .insert(submissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }

  async getTeamSubmissions(teamId: string, roundId: string): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(and(
        eq(submissions.teamId, teamId),
        eq(submissions.roundId, roundId)
      ));
  }

  async awardBadge(userId: string, badgeName: string, eventId?: string): Promise<Badge> {
    const [badge] = await db
      .insert(badges)
      .values({
        userId,
        eventId,
        type: 'achievement',
        name: badgeName,
        description: `Awarded for ${badgeName}`
      })
      .returning();
    return badge;
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    return await db
      .select()
      .from(badges)
      .where(eq(badges.userId, userId))
      .orderBy(desc(badges.awardedAt));
  }

  async generateCertificate(userId: string, eventId: string, type: string): Promise<Certificate> {
    const [certificate] = await db
      .insert(certificates)
      .values({
        userId,
        eventId,
        type,
        title: `${type} Certificate`,
        description: `Certificate of ${type}`,
        certificateUrl: `/certificates/${randomUUID()}.pdf`
      })
      .returning();
    return certificate;
  }

  async followOrganization(userId: string, orgId: string): Promise<void> {
    await db.insert(organizationFollowers).values({
      userId,
      organizationId: orgId
    });
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    await db.insert(userConnections).values({
      followerId,
      followingId
    });
  }

  async getUserConnections(userId: string): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        bio: users.bio,
        university: users.university,
        role: users.role,
        avatarUrl: users.avatarUrl,
        isVerified: users.isVerified,
        globalPoints: users.globalPoints,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        password: users.password
      })
      .from(users)
      .innerJoin(userConnections, eq(users.id, userConnections.followingId))
      .where(eq(userConnections.followerId, userId));
  }

  async getGlobalLeaderboard(limit: number = 50): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.globalPoints))
      .limit(limit);
  }

  async getUserRank(userId: string): Promise<number> {
    const [result] = await db
      .select({ rank: sql`rank() over (order by global_points desc)` })
      .from(users)
      .where(eq(users.id, userId));
    return Number(result?.rank) || 0;
  }

  async getRecentActivity(limit: number = 20): Promise<any[]> {
    // This would be a complex query joining multiple tables
    // For now, return submissions as activity
    return await db
      .select({
        id: submissions.id,
        type: sql`'submission'`,
        userId: submissions.submittedById,
        eventId: submissions.eventId,
        teamId: submissions.teamId,
        createdAt: submissions.submittedAt
      })
      .from(submissions)
      .orderBy(desc(submissions.submittedAt))
      .limit(limit);
  }
}

import { MongoDBStorage } from './mongodb-storage';

export const storage = new MongoDBStorage();
