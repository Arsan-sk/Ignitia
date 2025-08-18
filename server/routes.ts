import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertEventSchema, insertTeamSchema, insertSubmissionSchema, User } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
      const eventData = insertEventSchema.parse(req.body);
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

  return httpServer;
}
