import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const mongoUri = process.env.ATLAS_URL || process.env.DATABASE_URL;
const dbName = process.env.MONGO_DB_NAME || 'Ignitia';

if (!mongoUri) {
  throw new Error(
    "ATLAS_URL or DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const connectMongoDB = async () => {
  try {
    const safeUri = mongoUri.replace(/:[^:@]*@/, ':***@');
    console.log(`[DB] Connecting to MongoDB: ${safeUri} (dbName=${dbName})`);
    const conn = await mongoose.connect(mongoUri as string, {
      dbName,
    });
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error);
    throw error;
  }
};

// Define MongoDB schemas that match your PostgreSQL structure
const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  bio: { type: String },
  university: { type: String },
  role: { type: String, enum: ['participant', 'organizer', 'admin'], default: 'participant' },
  avatarUrl: { type: String },
  isVerified: { type: Boolean, default: false },
  globalPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const organizationSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  handle: { type: String, required: true, unique: true },
  description: { type: String },
  logoUrl: { type: String },
  bannerUrl: { type: String },
  website: { type: String },
  isVerified: { type: Boolean, default: false },
  createdById: { type: String, required: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['hackathon', 'conference', 'meetup', 'fest'], required: true },
  mode: { type: String, enum: ['online', 'offline', 'hybrid'], required: true },
  status: { type: String, enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'], default: 'draft' },
  bannerUrl: { type: String },
  maxParticipants: { type: Number },
  registrationStartAt: { type: Date, required: true },
  registrationEndAt: { type: Date, required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  venue: { type: String },
  organizationId: { type: String, required: true, ref: 'Organization' },
  createdById: { type: String, required: true, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

const teamSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  description: { type: String },
  eventId: { type: String, required: true, ref: 'Event' },
  leaderId: { type: String, required: true, ref: 'User' },
  maxMembers: { type: Number, default: 4 },
  inviteCode: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const teamMemberSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  teamId: { type: String, required: true, ref: 'Team' },
  userId: { type: String, required: true, ref: 'User' },
  role: { type: String, enum: ['leader', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now }
});

const eventRegistrationSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  eventId: { type: String, required: true, ref: 'Event' },
  userId: { type: String, required: true, ref: 'User' },
  teamId: { type: String, ref: 'Team' },
  status: { type: String, default: 'registered' },
  registeredAt: { type: Date, default: Date.now }
});

const submissionSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  eventId: { type: String, required: true, ref: 'Event' },
  roundId: { type: String, required: true },
  teamId: { type: String, required: true, ref: 'Team' },
  submittedById: { type: String, required: true, ref: 'User' },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  attachments: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['pending', 'submitted', 'evaluated'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now }
});

const badgeSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, required: true, ref: 'User' },
  eventId: { type: String, ref: 'Event' },
  type: { type: String, enum: ['winner', 'participant', 'achievement', 'special'], required: true },
  name: { type: String, required: true },
  description: { type: String },
  iconUrl: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  awardedAt: { type: Date, default: Date.now }
});

const certificateSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, required: true, ref: 'User' },
  eventId: { type: String, required: true, ref: 'Event' },
  teamId: { type: String, ref: 'Team' },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  certificateUrl: { type: String },
  issuedAt: { type: Date, default: Date.now }
});

// Missing schemas from PostgreSQL version
const eventRoundSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  eventId: { type: String, required: true, ref: 'Event' },
  name: { type: String, required: true },
  description: { type: String },
  roundNumber: { type: Number, required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  maxScore: { type: Number, default: 100 },
  submissionFormSchema: { type: mongoose.Schema.Types.Mixed },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const evaluationSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  submissionId: { type: String, required: true, ref: 'Submission' },
  roundId: { type: String, required: true, ref: 'EventRound' },
  evaluatorId: { type: String, required: true, ref: 'User' },
  score: { type: Number, required: true },
  feedback: { type: String },
  rubricScores: { type: mongoose.Schema.Types.Mixed },
  evaluatedAt: { type: Date, default: Date.now }
});

const organizationFollowerSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  organizationId: { type: String, required: true, ref: 'Organization' },
  userId: { type: String, required: true, ref: 'User' },
  followedAt: { type: Date, default: Date.now }
});

const userConnectionSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  followerId: { type: String, required: true, ref: 'User' },
  followingId: { type: String, required: true, ref: 'User' },
  isMutual: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const announcementSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  eventId: { type: String, required: true, ref: 'Event' },
  authorId: { type: String, required: true, ref: 'User' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  isPinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const qaThreadSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  eventId: { type: String, required: true, ref: 'Event' },
  authorId: { type: String, required: true, ref: 'User' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  isResolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const qaReplySchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  threadId: { type: String, required: true, ref: 'QAThread' },
  authorId: { type: String, required: true, ref: 'User' },
  content: { type: String, required: true },
  isAnswer: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Create models
export const User = mongoose.model('User', userSchema);
export const Organization = mongoose.model('Organization', organizationSchema);
export const Event = mongoose.model('Event', eventSchema);
export const Team = mongoose.model('Team', teamSchema);
export const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
export const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);
export const Submission = mongoose.model('Submission', submissionSchema);
export const Badge = mongoose.model('Badge', badgeSchema);
export const Certificate = mongoose.model('Certificate', certificateSchema);

// Additional models
export const EventRound = mongoose.model('EventRound', eventRoundSchema);
export const Evaluation = mongoose.model('Evaluation', evaluationSchema);
export const OrganizationFollower = mongoose.model('OrganizationFollower', organizationFollowerSchema);
export const UserConnection = mongoose.model('UserConnection', userConnectionSchema);
export const Announcement = mongoose.model('Announcement', announcementSchema);
export const QAThread = mongoose.model('QAThread', qaThreadSchema);
export const QAReply = mongoose.model('QAReply', qaReplySchema);
