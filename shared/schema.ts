import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['participant', 'organizer', 'admin']);
export const eventTypeEnum = pgEnum('event_type', ['hackathon', 'conference', 'meetup', 'fest']);
export const eventModeEnum = pgEnum('event_mode', ['online', 'offline', 'hybrid']);
export const eventStatusEnum = pgEnum('event_status', ['draft', 'published', 'ongoing', 'completed', 'cancelled']);
export const submissionStatusEnum = pgEnum('submission_status', ['pending', 'submitted', 'evaluated']);
export const teamMemberRoleEnum = pgEnum('team_member_role', ['leader', 'member']);
export const badgeTypeEnum = pgEnum('badge_type', ['winner', 'participant', 'achievement', 'special']);

// Users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  bio: text("bio"),
  university: text("university"),
  role: roleEnum("role").notNull().default('participant'),
  avatarUrl: text("avatar_url"),
  isVerified: boolean("is_verified").default(false),
  globalPoints: integer("global_points").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});

// Organizations
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  handle: text("handle").notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  website: text("website"),
  isVerified: boolean("is_verified").default(false),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").default(sql`now()`)
});

// Organization Followers
export const organizationFollowers = pgTable("organization_followers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  followedAt: timestamp("followed_at").default(sql`now()`)
});

// User Connections
export const userConnections = pgTable("user_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  isMutual: boolean("is_mutual").default(false),
  createdAt: timestamp("created_at").default(sql`now()`)
});

// Events
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: eventTypeEnum("type").notNull(),
  mode: eventModeEnum("mode").notNull(),
  status: eventStatusEnum("status").notNull().default('draft'),
  bannerUrl: text("banner_url"),
  maxParticipants: integer("max_participants"),
  registrationStartAt: timestamp("registration_start_at").notNull(),
  registrationEndAt: timestamp("registration_end_at").notNull(),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  venue: text("venue"),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  metadata: jsonb("metadata"), // Store event-specific configs
  createdAt: timestamp("created_at").default(sql`now()`)
});

// Event Rounds
export const eventRounds = pgTable("event_rounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  name: text("name").notNull(),
  description: text("description"),
  roundNumber: integer("round_number").notNull(),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  maxScore: integer("max_score").default(100),
  submissionFormSchema: jsonb("submission_form_schema"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").default(sql`now()`)
});

// Teams
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  eventId: varchar("event_id").notNull().references(() => events.id),
  leaderId: varchar("leader_id").notNull().references(() => users.id),
  maxMembers: integer("max_members").default(4),
  inviteCode: text("invite_code").unique(),
  createdAt: timestamp("created_at").default(sql`now()`)
});

// Team Members
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: teamMemberRoleEnum("role").notNull().default('member'),
  joinedAt: timestamp("joined_at").default(sql`now()`)
});

// Event Registrations
export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  teamId: varchar("team_id").references(() => teams.id),
  status: text("status").notNull().default('registered'),
  registeredAt: timestamp("registered_at").default(sql`now()`)
});

// Submissions
export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  roundId: varchar("round_id").notNull().references(() => eventRounds.id),
  teamId: varchar("team_id").notNull().references(() => teams.id),
  submittedById: varchar("submitted_by_id").notNull().references(() => users.id),
  content: jsonb("content").notNull(), // Flexible submission data
  attachments: jsonb("attachments"), // File URLs and metadata
  status: submissionStatusEnum("status").default('pending'),
  submittedAt: timestamp("submitted_at").default(sql`now()`)
});

// Evaluations
export const evaluations = pgTable("evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").notNull().references(() => submissions.id),
  roundId: varchar("round_id").notNull().references(() => eventRounds.id),
  evaluatorId: varchar("evaluator_id").notNull().references(() => users.id),
  score: integer("score").notNull(),
  feedback: text("feedback"),
  rubricScores: jsonb("rubric_scores"),
  evaluatedAt: timestamp("evaluated_at").default(sql`now()`)
});

// Badges
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventId: varchar("event_id").references(() => events.id),
  type: badgeTypeEnum("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  metadata: jsonb("metadata"),
  awardedAt: timestamp("awarded_at").default(sql`now()`)
});

// Certificates
export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventId: varchar("event_id").notNull().references(() => events.id),
  teamId: varchar("team_id").references(() => teams.id),
  type: text("type").notNull(), // winner, participant, completion
  title: text("title").notNull(),
  description: text("description"),
  certificateUrl: text("certificate_url"),
  issuedAt: timestamp("issued_at").default(sql`now()`)
});

// Announcements
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").default(sql`now()`)
});

// Q&A Threads
export const qaThreads = pgTable("qa_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").default(sql`now()`)
});

// Q&A Replies
export const qaReplies = pgTable("qa_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => qaThreads.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isAnswer: boolean("is_answer").default(false),
  createdAt: timestamp("created_at").default(sql`now()`)
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  organizations: many(organizations),
  teams: many(teams),
  teamMemberships: many(teamMembers),
  badges: many(badges),
  certificates: many(certificates),
  followers: many(userConnections, { relationName: "follower" }),
  following: many(userConnections, { relationName: "following" })
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [organizations.createdById],
    references: [users.id]
  }),
  followers: many(organizationFollowers),
  events: many(events)
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [events.organizationId],
    references: [organizations.id]
  }),
  createdBy: one(users, {
    fields: [events.createdById],
    references: [users.id]
  }),
  rounds: many(eventRounds),
  teams: many(teams),
  registrations: many(eventRegistrations),
  submissions: many(submissions),
  announcements: many(announcements),
  qaThreads: many(qaThreads)
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  event: one(events, {
    fields: [teams.eventId],
    references: [events.id]
  }),
  leader: one(users, {
    fields: [teams.leaderId],
    references: [users.id]
  }),
  members: many(teamMembers),
  submissions: many(submissions)
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  globalPoints: true
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  inviteCode: true
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
export type EventRound = typeof eventRounds.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type QAThread = typeof qaThreads.$inferSelect;
export type QAReply = typeof qaReplies.$inferSelect;
