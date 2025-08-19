import { 
  User as MongoUser, Organization as MongoOrganization, Event as MongoEvent, 
  Team as MongoTeam, TeamMember as MongoTeamMember, EventRegistration as MongoEventRegistration,
  Submission as MongoSubmission, Badge as MongoBadge, Certificate as MongoCertificate,
  EventRound as MongoEventRound, Evaluation as MongoEvaluation, 
  OrganizationFollower as MongoOrganizationFollower, UserConnection as MongoUserConnection,
  Announcement as MongoAnnouncement, QAThread as MongoQAThread, QAReply as MongoQAReply
} from './mongodb';
import { IStorage } from './storage';
import { randomUUID } from 'crypto';
import { 
  type User, type InsertUser, type Organization, type InsertOrganization,
  type Event, type InsertEvent, type Team, type InsertTeam,
  type InsertSubmission, type Submission, type Badge, type Certificate
} from "@shared/schema";

export class MongoDBStorage implements IStorage {
  // Convert MongoDB document to PostgreSQL-compatible format
  private mongoToPostgres(doc: any): any {
    if (!doc) return undefined;
    
    const obj = doc.toObject ? doc.toObject() : doc;
    const { _id, __v, ...rest } = obj;
    return {
      id: _id,
      ...rest
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await MongoUser.findById(id);
    return user ? this.mongoToPostgres(user) : undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const user = await MongoUser.findById(id);
    return user ? this.mongoToPostgres(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await MongoUser.findOne({ username });
    return user ? this.mongoToPostgres(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await MongoUser.findOne({ email });
    return user ? this.mongoToPostgres(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = new MongoUser(insertUser);
    const savedUser = await user.save();
    return this.mongoToPostgres(savedUser);
  }

  async updateUserPoints(userId: string, points: number): Promise<void> {
    await MongoUser.findByIdAndUpdate(userId, {
      $inc: { globalPoints: points },
      updatedAt: new Date()
    });
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const org = await MongoOrganization.findById(id);
    return org ? this.mongoToPostgres(org) : undefined;
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const org = new MongoOrganization(insertOrg);
    const savedOrg = await org.save();
    return this.mongoToPostgres(savedOrg);
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const orgs = await MongoOrganization.find({ createdById: userId });
    return orgs.map(org => this.mongoToPostgres(org));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const event = await MongoEvent.findById(id);
    return event ? this.mongoToPostgres(event) : undefined;
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    const registrations = await MongoEventRegistration.find({ userId }).populate('eventId');
    return registrations.map(reg => this.mongoToPostgres(reg.eventId));
  }

  async getOrganizationEvents(orgId: string): Promise<Event[]> {
    const events = await MongoEvent.find({ organizationId: orgId }).sort({ createdAt: -1 });
    return events.map(event => this.mongoToPostgres(event));
  }

  async getPublicEvents(): Promise<Event[]> {
    const events = await MongoEvent.find({ status: 'published' }).sort({ createdAt: -1 });
    return events.map(event => this.mongoToPostgres(event));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const event = new MongoEvent(insertEvent);
    const savedEvent = await event.save();
    return this.mongoToPostgres(savedEvent);
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const team = await MongoTeam.findById(id);
    return team ? this.mongoToPostgres(team) : undefined;
  }

  async getEventTeams(eventId: string): Promise<Team[]> {
    const teams = await MongoTeam.find({ eventId });
    return teams.map(team => this.mongoToPostgres(team));
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const inviteCode = randomUUID().substring(0, 8).toUpperCase();
    const team = new MongoTeam({ ...insertTeam, inviteCode });
    const savedTeam = await team.save();

    // Add leader as team member
    const teamMember = new MongoTeamMember({
      teamId: savedTeam._id,
      userId: savedTeam.leaderId,
      role: 'leader'
    });
    await teamMember.save();

    return this.mongoToPostgres(savedTeam);
  }

  async joinTeam(teamId: string, userId: string): Promise<void> {
    const teamMember = new MongoTeamMember({
      teamId,
      userId,
      role: 'member'
    });
    await teamMember.save();
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    const memberships = await MongoTeamMember.find({ userId }).populate('teamId');
    return memberships.map(membership => this.mongoToPostgres(membership.teamId));
  }

  async registerForEvent(eventId: string, userId: string, teamId?: string): Promise<void> {
    const registration = new MongoEventRegistration({
      eventId,
      userId,
      teamId
    });
    await registration.save();
  }

  async getUserRegistrations(userId: string): Promise<any[]> {
    const registrations = await MongoEventRegistration.find({ userId })
      .populate('eventId')
      .populate('teamId');
    return registrations.map(reg => ({
      event: this.mongoToPostgres(reg.eventId),
      registration: this.mongoToPostgres(reg),
      team: reg.teamId ? this.mongoToPostgres(reg.teamId) : null
    }));
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const submission = new MongoSubmission(insertSubmission);
    const savedSubmission = await submission.save();
    return this.mongoToPostgres(savedSubmission);
  }

  async getTeamSubmissions(teamId: string, roundId: string): Promise<Submission[]> {
    const submissions = await MongoSubmission.find({ teamId, roundId });
    return submissions.map(sub => this.mongoToPostgres(sub));
  }

  async awardBadge(userId: string, badgeName: string, eventId?: string): Promise<Badge> {
    const badge = new MongoBadge({
      userId,
      eventId,
      type: 'achievement',
      name: badgeName,
      description: `Awarded for ${badgeName}`
    });
    const savedBadge = await badge.save();
    return this.mongoToPostgres(savedBadge);
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    const badges = await MongoBadge.find({ userId }).sort({ awardedAt: -1 });
    return badges.map(badge => this.mongoToPostgres(badge));
  }

  async generateCertificate(userId: string, eventId: string, type: string): Promise<Certificate> {
    const certificate = new MongoCertificate({
      userId,
      eventId,
      type,
      title: `${type} Certificate`,
      description: `Certificate of ${type}`,
      certificateUrl: `/certificates/${randomUUID()}.pdf`
    });
    const savedCertificate = await certificate.save();
    return this.mongoToPostgres(savedCertificate);
  }

  async followOrganization(userId: string, orgId: string): Promise<void> {
    const existingFollow = await MongoOrganizationFollower.findOne({ userId, organizationId: orgId });
    if (!existingFollow) {
      const follow = new MongoOrganizationFollower({ userId, organizationId: orgId });
      await follow.save();
    }
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    const existingConnection = await MongoUserConnection.findOne({ followerId, followingId });
    if (!existingConnection) {
      // Check if the target user also follows back
      const reverseConnection = await MongoUserConnection.findOne({ 
        followerId: followingId, 
        followingId: followerId 
      });
      
      const connection = new MongoUserConnection({
        followerId,
        followingId,
        isMutual: !!reverseConnection
      });
      await connection.save();
      
      // Update reverse connection to be mutual if it exists
      if (reverseConnection) {
        await MongoUserConnection.findByIdAndUpdate(reverseConnection._id, { isMutual: true });
      }
    }
  }

  async getUserConnections(userId: string): Promise<User[]> {
    const connections = await MongoUserConnection.find({ followerId: userId }).populate('followingId');
    return connections.map(conn => this.mongoToPostgres(conn.followingId));
  }

  async getGlobalLeaderboard(limit: number = 50): Promise<User[]> {
    const users = await MongoUser.find({}).sort({ globalPoints: -1 }).limit(limit);
    return users.map(user => this.mongoToPostgres(user));
  }

  async getUserRank(userId: string): Promise<number> {
    const userCount = await MongoUser.countDocuments({});
    const user = await MongoUser.findById(userId);
    if (!user) return 0;

    const betterUsers = await MongoUser.countDocuments({
      globalPoints: { $gt: user.globalPoints }
    });
    return betterUsers + 1;
  }

  async getRecentActivity(limit: number = 20): Promise<any[]> {
    const submissions = await MongoSubmission.find({})
      .sort({ submittedAt: -1 })
      .limit(limit)
      .populate('submittedById eventId teamId');

    return submissions.map(sub => ({
      id: sub._id,
      type: 'submission',
      userId: sub.submittedById,
      eventId: sub.eventId,
      teamId: sub.teamId,
      createdAt: sub.submittedAt
    }));
  }
}
