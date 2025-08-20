import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertEventSchema, insertTeamSchema, insertSubmissionSchema, User } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// Mongo models for org overview computations
import { Event as MongoEvent, EventRound as MongoEventRound, EventRegistration as MongoEventRegistration, Submission as MongoSubmission, Announcement as MongoAnnouncement, QAThread as MongoQAThread } from "./mongodb";

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: User;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Auth middleware
const authenticateToken = (req: AuthenticatedRequest, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) return res.sendStatus(403);
    
    try {
      const user = await storage.getUserById(decoded.userId);
      if (!user) return res.sendStatus(403);
      req.user = user;
      next();
    } catch (error) {
      return res.sendStatus(403);
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const connectedClients = new Set<WebSocket>();
  
  wss.on('connection', (ws: WebSocket) => {
    connectedClients.add(ws);
    
    ws.on('close', () => {
      connectedClients.delete(ws);
    });
  });
  
  // Broadcast function
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Registration failed' });
    }
  });
  
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });
  
  app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      res.json({ ...req.user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Org routes (current user's organizations)
  app.get('/api/orgs/mine', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      // Using Mongo model directly to get orgs created by user
      const orgs = await (await import('./mongodb')).Organization.find({ createdById: req.user.id }).sort({ createdAt: -1 });
      res.json(orgs.map((o: any) => ({ id: o._id, name: o.name, handle: o.handle, createdAt: o.createdAt })));
    } catch {
      res.status(500).json({ message: 'Failed to get organizations' });
    }
  });

  // User routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  });
  
  app.get('/api/users/:id/badges', async (req, res) => {
    try {
      const badges = await storage.getUserBadges(req.params.id);
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get badges' });
    }
  });
  
  app.get('/api/users/:id/teams', async (req, res) => {
    try {
      const teams = await storage.getUserTeams(req.params.id);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get teams' });
    }
  });

  // Organization-scoped routes
  app.get('/api/orgs/:orgId/overview', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const orgId = req.params.orgId;

      const db = await import('./mongodb');
      const now = new Date();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Stats
      const [activeEvents, totalParticipantsAgg, ongoingRoundsAgg, submissions7d] = await Promise.all([
        db.Event.countDocuments({ organizationId: orgId, status: { $in: ['published', 'ongoing'] } }),
        db.EventRegistration.countDocuments({ organizationId: orgId, status: { $in: ['approved', 'pending'] } }),
        db.Event.aggregate([
          { $match: { organizationId: orgId, type: 'hackathon', 'metadata.rounds': { $exists: true } } },
          { $unwind: '$metadata.rounds' },
          { $match: { 'metadata.rounds.status': 'open' } },
          { $count: 'count' }
        ]).then(r => (r?.[0]?.count ?? 0)),
        db.Submission.countDocuments({ organizationId: orgId, createdAt: { $gte: sevenDaysAgo } })
      ]);

      // Recent activity
      const [recentAnnouncements, recentSubmissions, recentQnA] = await Promise.all([
        db.Announcement.find({ organizationId: orgId }).sort({ publishedAt: -1 }).limit(5),
        db.Submission.find({ organizationId: orgId }).sort({ createdAt: -1 }).limit(5),
        db.QAThread.find({ organizationId: orgId }).sort({ createdAt: -1 }).limit(5)
      ]);

      // Upcoming events
      const upcomingEvents = await db.Event.find({ organizationId: orgId, startAt: { $gte: now }, status: { $ne: 'archived' } })
        .sort({ startAt: 1 })
        .limit(5)
        .select(['_id', 'title', 'startAt']);

      res.json({
        stats: {
          activeEvents,
          totalParticipants: totalParticipantsAgg,
          ongoingRounds: ongoingRoundsAgg,
          submissions7d
        },
        recent: {
          announcements: recentAnnouncements.map((a: any) => ({ id: a._id, title: a.title ?? 'Announcement', publishedAt: a.publishedAt ?? a.createdAt })),
          submissions: recentSubmissions.map((s: any) => ({ id: s._id, teamId: s.teamId ?? s.userId, createdAt: s.createdAt })),
          qna: recentQnA.map((q: any) => ({ id: q._id, title: q.title ?? (q.text?.slice(0, 50) || 'Q&A'), createdAt: q.createdAt }))
        },
        upcomingEvents: upcomingEvents.map((e: any) => ({ id: e._id, title: e.title, startAt: e.startAt }))
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to load org overview' });
    }
  });

  // Get organization details
  app.get('/api/orgs/:orgId', async (req, res) => {
    try {
      const orgId = req.params.orgId;
      const db = await import('./mongodb');
      const org = await db.Organization.findById(orgId);
      
      if (!org) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      res.json({
        id: org._id,
        name: org.name,
        description: org.description,
        logoUrl: org.logoUrl,
        bannerUrl: org.bannerUrl,
        website: org.website,
        email: org.email,
        location: org.location,
        twitter: org.twitter,
        linkedin: org.linkedin,
        instagram: org.instagram,
        github: org.github,
        mission: org.mission,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get organization' });
    }
  });

  // Update organization
  app.patch('/api/orgs/:orgId', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const orgId = req.params.orgId;
      const updates = req.body;
      const db = await import('./mongodb');
      
      const org = await db.Organization.findByIdAndUpdate(
        orgId,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (!org) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      res.json({
        id: org._id,
        name: org.name,
        description: org.description,
        logoUrl: org.logoUrl,
        bannerUrl: org.bannerUrl,
        website: org.website,
        email: org.email,
        location: org.location,
        twitter: org.twitter,
        linkedin: org.linkedin,
        instagram: org.instagram,
        github: org.github,
        mission: org.mission,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update organization' });
    }
  });

  // Get organization followers (placeholder)
  app.get('/api/orgs/:orgId/followers', async (req, res) => {
    try {
      // Placeholder - will be implemented when follower system is added
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get followers' });
    }
  });

  // Get organization badges (placeholder)
  app.get('/api/orgs/:orgId/badges', async (req, res) => {
    try {
      // Placeholder - will be implemented when badge system is added
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get badges' });
    }
  });

  app.get('/api/orgs/:orgId/events', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const orgId = req.params.orgId;
      const { status, q, type } = req.query as any;
      const db = await import('./mongodb');

      const filter: any = { organizationId: orgId };
      if (status && status !== 'all') filter.status = status;
      if (type && type !== 'all') filter.type = type;
      if (q) filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];

      const events = await db.Event.find(filter).sort({ createdAt: -1 });
      res.json(events.map((e: any) => ({
        id: e._id,
        title: e.title,
        description: e.description,
        status: e.status,
        type: e.type,
        startAt: e.startAt,
        endAt: e.endAt,
        bannerUrl: e.bannerUrl,
        tags: e.tags ?? []
      })));
    } catch (error) {
      res.status(500).json({ message: 'Failed to load org events' });
    }
  });

  // Submissions and rounds management
  app.get('/api/events/:eventId/submissions', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = req.params.eventId;
      const { round, status } = req.query as any;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      const filter: any = { eventId };
      if (round && round !== 'all') filter.roundId = round;
      if (status && status !== 'all') filter.status = status;

      const submissions = await db.Submission.find(filter)
        .populate('teamId', 'name')
        .populate('userId', 'firstName lastName')
        .sort({ submittedAt: -1 });

      const formattedSubmissions = submissions.map((s: any) => ({
        id: s._id,
        teamId: s.teamId?._id,
        teamName: s.teamId?.name,
        userId: s.userId?._id,
        userName: s.userId ? `${s.userId.firstName} ${s.userId.lastName}` : null,
        status: s.status,
        roundId: s.roundId,
        roundNumber: s.roundNumber || 1,
        githubUrl: s.githubUrl,
        videoUrl: s.videoUrl,
        submittedAt: s.submittedAt,
        feedback: s.feedback,
        score: s.score,
        maxScore: s.maxScore,
        memberCount: s.memberCount || 1
      }));

      res.json(formattedSubmissions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get submissions' });
    }
  });

  app.patch('/api/events/:eventId/rounds/:roundId', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { eventId, roundId } = req.params;
      const { status, formEnabled } = req.body;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      const event = await db.Event.findById(eventId);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      // Update round status in event metadata
      const rounds = event.metadata?.rounds || [];
      const roundIndex = rounds.findIndex((r: any, i: number) => (r.id || i.toString()) === roundId);
      if (roundIndex !== -1) {
        rounds[roundIndex].status = status;
        if (formEnabled !== undefined) rounds[roundIndex].formEnabled = formEnabled;
        
        await db.Event.findByIdAndUpdate(eventId, {
          'metadata.rounds': rounds
        });
      }

      res.json({ message: 'Round updated successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to update round' });
    }
  });

  app.patch('/api/submissions/:submissionId', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const submissionId = req.params.submissionId;
      const { status, feedback, score } = req.body;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      const updateData: any = { status };
      if (feedback) updateData.feedback = feedback;
      if (score !== undefined) updateData.score = score;
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = req.user.id;

      const submission = await db.Submission.findByIdAndUpdate(
        submissionId,
        updateData,
        { new: true }
      );

      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      res.json({ message: 'Submission reviewed successfully', submission });
    } catch (error) {
      res.status(400).json({ message: 'Failed to review submission' });
    }
  });

  app.post('/api/events/:eventId/rounds/:roundId/advance', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { eventId, roundId } = req.params;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      const event = await db.Event.findById(eventId);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      // Get approved submissions for this round
      const approvedSubmissions = await db.Submission.find({
        eventId,
        roundId,
        status: 'approved'
      }).sort({ score: -1 });

      // Logic to advance teams to next round
      // For now, we'll advance all approved submissions
      const rounds = event.metadata?.rounds || [];
      const currentRoundIndex = rounds.findIndex((r: any, i: number) => (r.id || i.toString()) === roundId);
      const nextRoundIndex = currentRoundIndex + 1;

      if (nextRoundIndex < rounds.length) {
        const nextRoundId = rounds[nextRoundIndex].id || nextRoundIndex.toString();
        
        // Create placeholder submissions for next round
        for (const submission of approvedSubmissions) {
          await db.Submission.create({
            eventId,
            roundId: nextRoundId,
            roundNumber: nextRoundIndex + 1,
            teamId: submission.teamId,
            userId: submission.userId,
            status: 'pending',
            submittedAt: new Date()
          });
        }
      }

      res.json({ 
        message: 'Teams advanced successfully',
        advancedCount: approvedSubmissions.length
      });
    } catch (error) {
      res.status(400).json({ message: 'Failed to advance teams' });
    }
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getPublicEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get events' });
    }
  });
  
  app.get('/api/events/:id', async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get event' });
    }
  });
  
  app.post('/api/events', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      // For MongoDB, we need to convert date strings to Date objects
      const eventData = {
        ...req.body,
        registrationStartAt: new Date(req.body.registrationStartAt),
        registrationEndAt: new Date(req.body.registrationEndAt),
        startAt: new Date(req.body.startAt),
        endAt: new Date(req.body.endAt),
        maxParticipants: req.body.maxParticipants ? parseInt(req.body.maxParticipants) : undefined
      };
      
      const event = await storage.createEvent({
        ...eventData,
        createdById: req.user!.id
      });
      
      broadcast({
        type: 'new_event',
        data: event
      });
      
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create event' });
    }
  });
  
  // Update existing event
  app.patch('/api/events/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      
      const eventId = req.params.id;
      const updateData = {
        ...req.body,
        // Convert date strings to Date objects if they exist
        ...(req.body.registrationStartAt && { registrationStartAt: new Date(req.body.registrationStartAt) }),
        ...(req.body.registrationEndAt && { registrationEndAt: new Date(req.body.registrationEndAt) }),
        ...(req.body.startAt && { startAt: new Date(req.body.startAt) }),
        ...(req.body.endAt && { endAt: new Date(req.body.endAt) }),
        ...(req.body.maxParticipants && { maxParticipants: parseInt(req.body.maxParticipants) })
      };
      
      // Update in MongoDB
      const updatedEvent = await (await import('./mongodb')).Event.findByIdAndUpdate(
        eventId,
        updateData,
        { new: true }
      );
      
      if (!updatedEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      broadcast({
        type: 'event_updated',
        data: { eventId, updates: updateData }
      });
      
      res.json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update event' });
    }
  });

  // Duplicate event
  app.post('/api/events/:id/duplicate', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      
      const originalEvent = await (await import('./mongodb')).Event.findById(req.params.id);
      if (!originalEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Create duplicate with modified title and status
      const duplicateData = {
        ...originalEvent.toObject(),
        title: `${originalEvent.title} (Copy)`,
        status: 'draft',
        createdAt: new Date(),
        _id: undefined // Let MongoDB generate new ID
      };
      
      const duplicateEvent = new (await import('./mongodb')).Event(duplicateData);
      const savedEvent = await duplicateEvent.save();
      
      res.status(201).json({ 
        message: 'Event duplicated successfully', 
        event: savedEvent 
      });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to duplicate event' });
    }
  });

  // Archive/Unarchive event
  app.patch('/api/events/:id/archive', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      
      const { archived } = req.body;
      const eventId = req.params.id;
      
      const updatedEvent = await (await import('./mongodb')).Event.findByIdAndUpdate(
        eventId,
        { 
          status: archived ? 'archived' : 'draft',
          archivedAt: archived ? new Date() : null
        },
        { new: true }
      );
      
      if (!updatedEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      res.json({ 
        message: `Event ${archived ? 'archived' : 'unarchived'} successfully`, 
        event: updatedEvent 
      });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to archive event' });
    }
  });

  app.post('/api/events/:id/register', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { teamId } = req.body;
      await storage.registerForEvent(req.params.id, req.user!.id, teamId);
      
      broadcast({
        type: 'new_registration',
        data: { eventId: req.params.id, userId: req.user!.id }
      });
      
      res.json({ message: 'Successfully registered for event' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to register for event' });
    }
  });

  // Team routes
  app.get('/api/events/:eventId/teams', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = req.params.eventId;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      
      const teams = await (await import('./mongodb')).Team.find({ eventId })
        .populate('leaderId', 'firstName lastName email')
        .sort({ createdAt: -1 });
      
      const teamsWithMembers = await Promise.all(teams.map(async (team) => {
        const members = await (await import('./mongodb')).TeamMember.find({ teamId: team._id })
          .populate('userId', 'firstName lastName email');
        
        return {
          id: team._id,
          name: team.name,
          description: team.description,
          maxMembers: team.maxMembers,
          inviteCode: team.inviteCode,
          isOpen: true, // Add logic for team status
          memberCount: members.length,
          leader: team.leaderId ? {
            id: team.leaderId._id,
            name: `${team.leaderId.firstName} ${team.leaderId.lastName}`,
            email: team.leaderId.email
          } : null,
          members: members.map(member => ({
            id: member.userId._id,
            name: `${member.userId.firstName} ${member.userId.lastName}`,
            email: member.userId.email,
            role: member.role,
            joinedAt: member.joinedAt
          })),
          createdAt: team.createdAt
        };
      }));
      
      res.json(teamsWithMembers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get event teams' });
    }
  });

  app.get('/api/events/:eventId/registrations', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = req.params.eventId;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      
      const registrations = await (await import('./mongodb')).EventRegistration.find({ eventId })
        .populate('userId', 'firstName lastName email')
        .sort({ registeredAt: -1 });
      
      const registrationsWithUser = registrations.map(reg => ({
        id: reg._id,
        eventId: reg.eventId,
        teamId: reg.teamId,
        status: reg.status,
        registeredAt: reg.registeredAt,
        user: {
          id: reg.userId._id,
          firstName: reg.userId.firstName,
          lastName: reg.userId.lastName,
          email: reg.userId.email
        }
      }));
      
      res.json(registrationsWithUser);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get event registrations' });
    }
  });

  app.post('/api/teams', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam({
        ...teamData,
        leaderId: req.user!.id
      });
      res.status(201).json(team);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create team' });
    }
  });

  app.patch('/api/teams/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      
      const teamId = req.params.id;
      const updateData = req.body;
      
      const updatedTeam = await (await import('./mongodb')).Team.findByIdAndUpdate(
        teamId,
        updateData,
        { new: true }
      );
      
      if (!updatedTeam) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      res.json({ message: 'Team updated successfully', team: updatedTeam });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update team' });
    }
  });

  app.delete('/api/teams/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      
      const teamId = req.params.id;
      
      // Delete team members first
      await (await import('./mongodb')).TeamMember.deleteMany({ teamId });
      
      // Delete the team
      await (await import('./mongodb')).Team.findByIdAndDelete(teamId);
      
      res.json({ message: 'Team deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to delete team' });
    }
  });

  app.patch('/api/teams/:id/members', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      
      const teamId = req.params.id;
      const { userId, action } = req.body;
      
      const TeamMember = (await import('./mongodb')).TeamMember;
      const Team = (await import('./mongodb')).Team;
      
      switch (action) {
        case 'add':
          await TeamMember.create({ teamId, userId, role: 'member' });
          break;
        case 'remove':
          await TeamMember.findOneAndDelete({ teamId, userId });
          break;
        case 'promote':
          await TeamMember.findOneAndUpdate({ teamId, userId }, { role: 'leader' });
          break;
        case 'demote':
          await TeamMember.findOneAndUpdate({ teamId, userId }, { role: 'member' });
          break;
        default:
          return res.status(400).json({ message: 'Invalid action' });
      }
      
      res.json({ message: 'Team member updated successfully' });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update team member' });
    }
  });
  
  app.post('/api/teams/:id/join', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.joinTeam(req.params.id, req.user!.id);
      res.json({ message: 'Successfully joined team' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to join team' });
    }
  });

  // Submission routes
  app.post('/api/submissions', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const submissionData = insertSubmissionSchema.parse(req.body);
      const submission = await storage.createSubmission({
        ...submissionData,
        submittedById: req.user!.id
      });
      
      broadcast({
        type: 'new_submission',
        data: submission
      });
      
      res.status(201).json(submission);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create submission' });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard/global', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const users = await storage.getGlobalLeaderboard(limit);
      res.json(users.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      res.status(500).json({ message: 'Failed to get leaderboard' });
    }
  });
  
  app.get('/api/users/:id/rank', async (req, res) => {
    try {
      const rank = await storage.getUserRank(req.params.id);
      res.json({ rank });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user rank' });
    }
  });

  // Activity feed routes
  app.get('/api/activity/recent', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await storage.getRecentActivity(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get recent activity' });
    }
  });


  // Dashboard routes
  app.get('/api/dashboard/user/:id', authenticateToken, async (req, res) => {
    try {
      const userId = req.params.id;
      
      const [user, events, teams, badges, rank] = await Promise.all([
        storage.getUser(userId),
        storage.getUserEvents(userId),
        storage.getUserTeams(userId),
        storage.getUserBadges(userId),
        storage.getUserRank(userId)
      ]);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        user: { ...user, password: undefined },
        events,
        teams,
        badges,
        rank
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get dashboard data' });
    }
  });

  // Judging and leaderboard management
  app.get('/api/events/:eventId/judges', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = req.params.eventId;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      const judges = await db.Judge.find({ eventId })
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      const formattedJudges = judges.map((judge: any) => ({
        id: judge._id,
        name: judge.userId ? `${judge.userId.firstName} ${judge.userId.lastName}` : 'Unknown',
        email: judge.userId?.email || '',
        status: judge.status || 'invited',
        assignedRounds: judge.assignedRounds || [],
        createdAt: judge.createdAt
      }));

      res.json(formattedJudges);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get judges' });
    }
  });

  app.post('/api/events/:eventId/judges', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = req.params.eventId;
      const { email } = req.body;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      
      // Find user by email (in a real app, you'd send an invitation)
      // For now, create a placeholder judge record
      const judge = await db.Judge.create({
        eventId,
        email,
        status: 'invited',
        assignedRounds: [],
        createdAt: new Date()
      });

      res.json({ message: 'Judge invited successfully', judge });
    } catch (error) {
      res.status(400).json({ message: 'Failed to add judge' });
    }
  });

  app.delete('/api/events/:eventId/judges/:judgeId', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { judgeId } = req.params;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      await db.Judge.findByIdAndDelete(judgeId);

      res.json({ message: 'Judge removed successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to remove judge' });
    }
  });

  app.get('/api/events/:eventId/rubrics', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = req.params.eventId;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      const event = await db.Event.findById(eventId);
      
      if (!event) return res.status(404).json({ message: 'Event not found' });

      const rubrics = event.metadata?.rubrics || [
        { name: 'Technical Implementation', weight: 30, maxPoints: 10 },
        { name: 'Innovation & Creativity', weight: 25, maxPoints: 10 },
        { name: 'Code Quality', weight: 20, maxPoints: 10 },
        { name: 'Presentation', weight: 15, maxPoints: 10 },
        { name: 'Problem Solving', weight: 10, maxPoints: 10 }
      ];

      res.json(rubrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get rubrics' });
    }
  });

  app.put('/api/events/:eventId/rubrics', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = req.params.eventId;
      const { rubrics } = req.body;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      await db.Event.findByIdAndUpdate(eventId, {
        'metadata.rubrics': rubrics
      });

      res.json({ message: 'Rubrics updated successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to update rubrics' });
    }
  });

  app.post('/api/submissions/:submissionId/scores', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const submissionId = req.params.submissionId;
      const { scores, comments } = req.body;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      
      // Calculate total score
      const totalScore = Object.values(scores).reduce((sum: any, score: any) => sum + score, 0) / Object.keys(scores).length;
      
      // Update submission with score
      await db.Submission.findByIdAndUpdate(submissionId, {
        averageScore: totalScore,
        judgeScores: {
          ...scores,
          comments,
          judgeId: req.user.id,
          scoredAt: new Date()
        },
        lastScoredAt: new Date()
      });

      res.json({ message: 'Score submitted successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to submit score' });
    }
  });

  app.get('/api/events/:eventId/leaderboard', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = req.params.eventId;
      const { roundId } = req.query as any;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      const filter: any = { eventId, averageScore: { $exists: true } };
      if (roundId) filter.roundId = roundId;

      const submissions = await db.Submission.find(filter)
        .populate('teamId', 'name')
        .sort({ averageScore: -1 });

      const leaderboard = submissions.map((submission: any, index: number) => ({
        id: submission._id,
        teamId: submission.teamId?._id,
        teamName: submission.teamId?.name || `Team ${submission.teamId}`,
        totalScore: submission.averageScore,
        rank: index + 1,
        memberCount: submission.memberCount || 1,
        submittedAt: submission.submittedAt
      }));

      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get leaderboard' });
    }
  });

  app.post('/api/events/:eventId/leaderboard/recalculate', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = req.params.eventId;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      // For now, just return success - in a real implementation,
      // you would recalculate all scores based on the current rubrics
      res.json({ message: 'Leaderboard recalculated successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to recalculate leaderboard' });
    }
  });

  // Event Registration APIs
  app.post('/api/events/:eventId/register', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = req.params.eventId;
      const { teamName, teamMembers } = req.body;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      const event = await db.Event.findById(eventId);
      
      if (!event) return res.status(404).json({ message: 'Event not found' });
      
      // Check if registration is open
      const now = new Date();
      const regStartDate = new Date(event.registrationStartAt || event.startAt);
      const regEndDate = new Date(event.registrationEndAt || event.startAt);
      
      if (now < regStartDate || now > regEndDate) {
        return res.status(400).json({ message: 'Registration is not open for this event' });
      }

      // Check if user already registered
      const existingRegistration = await db.EventRegistration.findOne({ 
        eventId, 
        $or: [
          { userId: req.user.id },
          { 'teamMembers.userId': req.user.id }
        ]
      });
      
      if (existingRegistration) {
        return res.status(400).json({ message: 'Already registered for this event' });
      }

      // Create team if it's a team-based event
      let team;
      if (event.type === 'hackathon' && teamName) {
        team = await db.Team.create({
          name: teamName,
          eventId,
          leaderId: req.user.id,
          members: [{
            userId: req.user.id,
            username: req.user.username,
            role: 'leader',
            joinedAt: new Date()
          }],
          createdAt: new Date()
        });

        // Add team members if provided
        if (teamMembers && teamMembers.length > 0) {
          for (const member of teamMembers) {
            team.members.push({
              userId: member.userId,
              username: member.username,
              role: 'member',
              joinedAt: new Date()
            });
          }
          await team.save();
        }
      }

      // Create registration
      const registration = await db.EventRegistration.create({
        eventId,
        organizationId: event.organizationId,
        userId: req.user.id,
        teamId: team?._id,
        status: 'approved', // Auto-approve for now
        registeredAt: new Date()
      });

      // Update event participant count
      await db.Event.findByIdAndUpdate(eventId, {
        $inc: { participantCount: 1 }
      });

      res.json({ 
        message: 'Registration successful', 
        registration: {
          id: registration._id,
          eventId,
          teamId: team?._id,
          teamName: team?.name,
          status: registration.status
        }
      });
    } catch (error) {
      res.status(400).json({ message: 'Registration failed' });
    }
  });

  app.get('/api/events/:eventId/registration-status', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = req.params.eventId;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      const registration = await db.EventRegistration.findOne({
        eventId,
        userId: req.user.id
      }).populate('teamId');

      if (!registration) {
        return res.json({ registered: false });
      }

      res.json({
        registered: true,
        status: registration.status,
        teamId: registration.teamId?._id,
        teamName: registration.teamId?.name,
        hasTeam: !!registration.teamId,
        registeredAt: registration.registeredAt
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to check registration status' });
    }
  });

  // Team Management APIs
  app.get('/api/teams/:teamId', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = req.params.teamId;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      const team = await db.Team.findById(teamId).populate('eventId', 'title type');
      
      if (!team) return res.status(404).json({ message: 'Team not found' });

      res.json({
        id: team._id,
        name: team.name,
        eventId: team.eventId._id,
        eventTitle: team.eventId.title,
        leaderId: team.leaderId,
        members: team.members,
        createdAt: team.createdAt
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get team' });
    }
  });

  app.post('/api/teams/:teamId/invite', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = req.params.teamId;
      const { username } = req.body;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      const team = await db.Team.findById(teamId);
      
      if (!team) return res.status(404).json({ message: 'Team not found' });
      
      if (team.leaderId !== req.user.id) {
        return res.status(403).json({ message: 'Only team leader can invite members' });
      }

      // Find user by username
      const user = await db.User.findOne({ username });
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Check if user is already in team
      const existingMember = team.members.find((m: any) => m.userId === user._id.toString());
      if (existingMember) {
        return res.status(400).json({ message: 'User is already in the team' });
      }

      // Add member to team
      team.members.push({
        userId: user._id,
        username: user.username,
        role: 'member',
        joinedAt: new Date()
      });
      await team.save();

      res.json({ message: 'Member invited successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to invite member' });
    }
  });

  app.delete('/api/teams/:teamId/members/:userId', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { teamId, userId } = req.params;
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const db = await import('./mongodb');
      const team = await db.Team.findById(teamId);
      
      if (!team) return res.status(404).json({ message: 'Team not found' });
      
      if (team.leaderId !== req.user.id && req.user.id !== userId) {
        return res.status(403).json({ message: 'Unauthorized to remove this member' });
      }

      // Remove member from team
      team.members = team.members.filter((m: any) => m.userId !== userId);
      await team.save();

      res.json({ message: 'Member removed successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to remove member' });
    }
  });

  // Test data creation endpoint
  app.post('/api/test/create-sample-event', async (req, res) => {
    try {
      const db = await import('./mongodb');
      
      // Create sample organization if it doesn't exist
      let org = await db.Organization.findOne({ handle: 'techcorp' });
      if (!org) {
        org = await db.Organization.create({
          name: 'TechCorp Innovation Lab',
          handle: 'techcorp',
          description: 'Leading technology innovation hub',
          createdById: 'test-user-id',
          createdAt: new Date()
        });
      }

      // Create Algorithm X hackathon
      const event = await db.Event.create({
        title: 'Algorithm X',
        description: 'A competitive algorithmic programming hackathon featuring complex problem-solving challenges across multiple rounds. Test your coding skills, algorithmic thinking, and optimization techniques in this intensive 48-hour competition.',
        type: 'hackathon',
        mode: 'hybrid',
        status: 'published',
        organizationId: org._id,
        createdById: 'test-user-id',
        maxParticipants: 200,
        registrationStartAt: new Date('2024-12-01'),
        registrationEndAt: new Date('2024-12-20'),
        startAt: new Date('2025-01-15'),
        endAt: new Date('2025-01-17'),
        venue: 'TechCorp Campus, Silicon Valley',
        bannerUrl: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1200&h=400&fit=crop',
        tags: ['algorithms', 'competitive-programming', 'data-structures', 'optimization'],
        externalLinks: [
          { name: 'Problem Statements', url: 'https://algorithmx.dev/problems' },
          { name: 'Discord Community', url: 'https://discord.gg/algorithmx' }
        ],
        metadata: {
          rounds: [
            {
              id: 'round-1',
              name: 'Qualification Round',
              description: 'Basic algorithmic problems to test fundamental programming skills',
              startAt: new Date('2025-01-15T09:00:00Z'),
              endAt: new Date('2025-01-15T15:00:00Z'),
              maxScore: 100,
              status: 'scheduled',
              formEnabled: false
            },
            {
              id: 'round-2', 
              name: 'Advanced Algorithms',
              description: 'Complex data structures and advanced algorithmic challenges',
              startAt: new Date('2025-01-16T09:00:00Z'),
              endAt: new Date('2025-01-16T18:00:00Z'),
              maxScore: 200,
              status: 'scheduled',
              formEnabled: false
            },
            {
              id: 'round-3',
              name: 'Final Championship',
              description: 'Ultimate coding challenge with optimization and system design',
              startAt: new Date('2025-01-17T09:00:00Z'),
              endAt: new Date('2025-01-17T15:00:00Z'),
              maxScore: 300,
              status: 'scheduled',
              formEnabled: false
            }
          ]
        },
        createdAt: new Date()
      });

      // Create some sample teams and submissions
      const teams = await Promise.all([
        db.Team.create({
          eventId: event._id,
          name: 'Code Ninjas',
          description: 'Elite algorithmic problem solvers',
          maxMembers: 3,
          inviteCode: 'NINJA2025',
          leaderId: 'test-user-1',
          createdAt: new Date()
        }),
        db.Team.create({
          eventId: event._id,
          name: 'Binary Builders',
          description: 'Masters of data structures and algorithms',
          maxMembers: 3,
          inviteCode: 'BINARY25',
          leaderId: 'test-user-2',
          createdAt: new Date()
        }),
        db.Team.create({
          eventId: event._id,
          name: 'Stack Overflow',
          description: 'Recursive solution specialists',
          maxMembers: 2,
          inviteCode: 'STACK25',
          leaderId: 'test-user-3',
          createdAt: new Date()
        })
      ]);

      // Create sample submissions
      await Promise.all([
        db.Submission.create({
          eventId: event._id,
          roundId: 'round-1',
          roundNumber: 1,
          teamId: teams[0]._id,
          status: 'submitted',
          githubUrl: 'https://github.com/codeninjas/algorithmx-r1',
          videoUrl: 'https://youtube.com/watch?v=demo1',
          submittedAt: new Date('2025-01-15T14:30:00Z'),
          memberCount: 3
        }),
        db.Submission.create({
          eventId: event._id,
          roundId: 'round-1',
          roundNumber: 1,
          teamId: teams[1]._id,
          status: 'approved',
          githubUrl: 'https://github.com/binarybuilders/algorithmx-solutions',
          submittedAt: new Date('2025-01-15T13:45:00Z'),
          score: 85,
          maxScore: 100,
          feedback: 'Excellent implementation of sorting algorithms. Clean code structure.',
          memberCount: 3
        }),
        db.Submission.create({
          eventId: event._id,
          roundId: 'round-1',
          roundNumber: 1,
          teamId: teams[2]._id,
          status: 'under-review',
          githubUrl: 'https://github.com/stackoverflow/recursive-solutions',
          submittedAt: new Date('2025-01-15T14:55:00Z'),
          memberCount: 2
        })
      ]);

      res.json({
        message: 'Sample event "Algorithm X" created successfully',
        event: {
          id: event._id,
          title: event.title,
          organizationId: org._id,
          organizationName: org.name
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create sample event', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  return httpServer;
}
