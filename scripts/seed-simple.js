import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

dotenv.config();

// MongoDB connection
const mongoUri = "mongodb+srv://arsansk09:Ignitia2025@cluster0.ordetpq.mongodb.net/Ignitia?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "Ignitia";

console.log('Using MongoDB connection string:', mongoUri.replace(/:[^:@]*@/, ':***@'));

// Define schemas directly in this file to avoid import issues
const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  bio: { type: String },
  university: { type: String },
  role: { type: String, enum: ['admin', 'organizer', 'participant'], required: true },
  isVerified: { type: Boolean, default: false },
  avatarUrl: { type: String },
  location: { type: String },
  website: { type: String },
  github: { type: String },
  twitter: { type: String },
  linkedin: { type: String },
  phone: { type: String },
  skills: [{ type: String }],
  globalPoints: { type: Number, default: 0 },
  totalWins: { type: Number, default: 0 },
  eventsParticipated: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const organizationSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  handle: { type: String, required: true, unique: true },
  description: { type: String },
  logoUrl: { type: String },
  bannerUrl: { type: String },
  website: { type: String },
  email: { type: String },
  location: { type: String },
  twitter: { type: String },
  linkedin: { type: String },
  instagram: { type: String },
  github: { type: String },
  mission: { type: String },
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
  status: { type: String, enum: ['draft', 'published', 'ongoing', 'completed'], required: true },
  bannerUrl: { type: String },
  maxParticipants: { type: Number },
  registrationStartAt: { type: Date, required: true },
  registrationEndAt: { type: Date, required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  venue: { type: String },
  organizationId: { type: String, required: true, ref: 'Organization' },
  createdById: { type: String, required: true, ref: 'User' },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const eventRegistrationSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  eventId: { type: String, required: true, ref: 'Event' },
  userId: { type: String, required: true, ref: 'User' },
  status: { type: String, enum: ['registered', 'waitlisted', 'cancelled'], default: 'registered' },
  registeredAt: { type: Date, default: Date.now }
});

const badgeSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, required: true, ref: 'User' },
  eventId: { type: String, required: true, ref: 'Event' },
  type: { type: String, enum: ['participant', 'achievement', 'special'], required: true },
  name: { type: String, required: true },
  description: { type: String },
  iconUrl: { type: String },
  awardedAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Organization = mongoose.model('Organization', organizationSchema);
const Event = mongoose.model('Event', eventSchema);
const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);
const Badge = mongoose.model('Badge', badgeSchema);

async function main() {
  console.log('🚀 Seeding database with users, organizations, and events...');
  
  try {
    // Connect to MongoDB
    console.log(`[DB] Connecting to MongoDB: ${mongoUri.replace(/:[^:@]*@/, ':***@')} (dbName=${dbName})`);
    await mongoose.connect(mongoUri, { dbName });
    console.log(`[DB] MongoDB Connected: ${mongoose.connection.host}`);

    const password = 'password123';
    const hashed = await bcrypt.hash(password, 10);

    // Create participants
    const participants = [];
    for (let i = 1; i <= 10; i++) {
      const userData = {
        username: `participant${i.toString().padStart(2, '0')}`,
        email: `participant${i.toString().padStart(2, '0')}@example.com`,
        password: hashed,
        firstName: `Participant`,
        lastName: `${i}`,
        bio: `I am participant ${i} with interests in web development, AI, and blockchain.`,
        university: `University ${i}`,
        role: 'participant',
        isVerified: true,
        avatarUrl: `https://ui-avatars.com/api/?name=Participant+${i}&background=random`,
        location: ['New York', 'San Francisco', 'Boston', 'Chicago', 'Seattle'][Math.floor(Math.random() * 5)],
        website: `https://participant${i}.example.com`,
        github: `https://github.com/participant${i}`,
        twitter: `https://twitter.com/participant${i}`,
        linkedin: `https://linkedin.com/in/participant${i}`,
        phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning', 'Blockchain', 'UI/UX Design'].sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 4)),
        globalPoints: Math.floor(Math.random() * 1000),
        totalWins: Math.floor(Math.random() * 5),
        eventsParticipated: Math.floor(Math.random() * 10) + 1,
        currentStreak: Math.floor(Math.random() * 3)
      };

      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`ℹ️  User already exists: ${userData.email} (id=${existing._id})`);
        participants.push(existing);
        continue;
      }
      const doc = await User.create(userData);
      console.log(`✅ Created user: ${userData.email} (id=${doc._id})`);
      participants.push(doc);
    }

    // Create organizers
    const organizers = [];
    for (let i = 1; i <= 5; i++) {
      const userData = {
        username: `organizer${i.toString().padStart(2, '0')}`,
        email: `organizer${i.toString().padStart(2, '0')}@example.com`,
        password: hashed,
        firstName: `Organizer`,
        lastName: `${i}`,
        bio: `I am organizer ${i} representing a tech company that hosts hackathons and tech events.`,
        university: `Tech Company ${i}`,
        role: 'organizer',
        isVerified: true,
        avatarUrl: `https://ui-avatars.com/api/?name=Organizer+${i}&background=random`,
        location: ['New York', 'San Francisco', 'Boston', 'Chicago', 'Seattle'][Math.floor(Math.random() * 5)],
        website: `https://organizer${i}.example.com`,
        github: `https://github.com/organizer${i}`,
        twitter: `https://twitter.com/organizer${i}`,
        linkedin: `https://linkedin.com/in/organizer${i}`,
        phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
        skills: ['Event Management', 'Project Management', 'Marketing', 'Community Building'].sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 3))
      };

      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`ℹ️  User already exists: ${userData.email} (id=${existing._id})`);
        organizers.push(existing);
        continue;
      }
      const doc = await User.create(userData);
      console.log(`✅ Created user: ${userData.email} (id=${doc._id})`);
      organizers.push(doc);
    }

    // Create organizations for each organizer
    const organizations = [];
    for (let i = 0; i < organizers.length; i++) {
      const organizer = organizers[i];
      const orgData = {
        name: `${organizer.firstName}'s Tech Organization`,
        handle: `tech-org-${i + 1}`,
        description: `A technology organization that hosts hackathons and tech events.`,
        logoUrl: `https://ui-avatars.com/api/?name=Tech+Org+${i + 1}&background=random`,
        bannerUrl: `https://picsum.photos/seed/org${i + 1}/1200/300`,
        website: `https://techorg${i + 1}.example.com`,
        email: `info@techorg${i + 1}.example.com`,
        location: organizer.location,
        twitter: `https://twitter.com/techorg${i + 1}`,
        linkedin: `https://linkedin.com/company/techorg${i + 1}`,
        instagram: `https://instagram.com/techorg${i + 1}`,
        github: `https://github.com/techorg${i + 1}`,
        mission: `Our mission is to foster innovation and collaboration in the tech community.`,
        isVerified: true,
        createdById: organizer._id
      };

      const existingOrg = await Organization.findOne({ handle: orgData.handle });
      if (existingOrg) {
        console.log(`ℹ️  Organization exists: ${existingOrg.name} (id=${existingOrg._id})`);
        organizations.push(existingOrg);
        continue;
      }
      const org = await Organization.create(orgData);
      console.log(`✅ Created organization: ${org.name} (id=${org._id})`);
      organizations.push(org);
    }

    // Create events for each organization
    const events = [];
    const eventTypes = ['hackathon', 'conference', 'meetup', 'fest'];
    const eventModes = ['online', 'offline', 'hybrid'];
    const eventStatuses = ['draft', 'published', 'ongoing', 'completed'];
    const eventTopics = [
      'AI and Machine Learning',
      'Web Development',
      'Mobile App Development',
      'Blockchain and Cryptocurrency',
      'IoT and Hardware',
      'Cloud Computing',
      'Cybersecurity',
      'Data Science',
      'Game Development',
      'AR/VR',
      'Fintech',
      'Healthtech',
      'Edtech',
      'Sustainability'
    ];

    for (let i = 0; i < organizations.length; i++) {
      const org = organizations[i];
      const organizer = organizers[i];
      
      // Create 1-3 events per organization
      const numEvents = 1 + Math.floor(Math.random() * 3);
      
      for (let j = 0; j < numEvents; j++) {
        const now = new Date();
        const topic = eventTopics[Math.floor(Math.random() * eventTopics.length)];
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const mode = eventModes[Math.floor(Math.random() * eventModes.length)];
        const status = eventStatuses[Math.floor(Math.random() * eventStatuses.length)];
        
        // Generate random dates
        const registrationStartAt = new Date(now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        const registrationEndAt = new Date(registrationStartAt.getTime() + Math.floor(Math.random() * 30 + 15) * 24 * 60 * 60 * 1000);
        const startAt = new Date(registrationEndAt.getTime() + Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000);
        const endAt = new Date(startAt.getTime() + Math.floor(Math.random() * 15 + 1) * 24 * 60 * 60 * 1000);
        
        const eventData = {
          title: `${topic} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          description: `Join us for an exciting ${type} focused on ${topic}. This event will bring together experts and enthusiasts to collaborate, learn, and innovate.`,
          type,
          mode,
          status,
          bannerUrl: `https://picsum.photos/seed/event${i}${j}/1200/300`,
          maxParticipants: 50 + Math.floor(Math.random() * 150),
          registrationStartAt,
          registrationEndAt,
          startAt,
          endAt,
          venue: mode !== 'online' ? `${org.name} Headquarters, ${organizer.location}` : null,
          organizationId: org._id,
          createdById: organizer._id,
          metadata: {
            prize: `$${(1 + Math.floor(Math.random() * 10)) * 1000}`,
            tags: [topic, type, mode, ...eventTopics.sort(() => 0.5 - Math.random()).slice(0, 2)],
            rounds: type === 'hackathon' ? [
              {
                name: 'Ideation',
                description: 'Submit your project idea and initial concept',
                roundNumber: 1,
                startAt: new Date(startAt.getTime()),
                endAt: new Date(startAt.getTime() + 2 * 24 * 60 * 60 * 1000),
                maxScore: 100,
                isActive: status === 'ongoing'
              },
              {
                name: 'Development',
                description: 'Build your prototype and prepare for final submission',
                roundNumber: 2,
                startAt: new Date(startAt.getTime() + 3 * 24 * 60 * 60 * 1000),
                endAt: new Date(endAt.getTime() - 1 * 24 * 60 * 60 * 1000),
                maxScore: 100,
                isActive: false
              },
              {
                name: 'Final Submission',
                description: 'Submit your final project with documentation',
                roundNumber: 3,
                startAt: new Date(endAt.getTime() - 1 * 24 * 60 * 60 * 1000),
                endAt: new Date(endAt.getTime()),
                maxScore: 100,
                isActive: false
              }
            ] : []
          }
        };

        const existingEvent = await Event.findOne({ 
          title: eventData.title, 
          organizationId: org._id 
        });
        
        if (existingEvent) {
          console.log(`ℹ️  Event exists: ${existingEvent.title} (id=${existingEvent._id})`);
          events.push(existingEvent);
          continue;
        }
        
        const event = await Event.create(eventData);
        console.log(`✅ Created event: ${event.title} (id=${event._id})`);
        events.push(event);
        
        // Register some participants for this event
        const numParticipantsToRegister = Math.floor(Math.random() * participants.length);
        const shuffledParticipants = [...participants].sort(() => 0.5 - Math.random());
        
        for (let k = 0; k < numParticipantsToRegister; k++) {
          const participant = shuffledParticipants[k];
          
          const existingRegistration = await EventRegistration.findOne({
            eventId: event._id,
            userId: participant._id
          });
          
          if (!existingRegistration) {
            const registration = await EventRegistration.create({
              eventId: event._id,
              userId: participant._id,
              status: 'registered',
              registeredAt: new Date(registrationStartAt.getTime() + Math.random() * (registrationEndAt.getTime() - registrationStartAt.getTime()))
            });
            
            console.log(`✅ Registered participant ${participant.email} for event ${event.title}`);
            
            // Award badges for completed events
            if (status === 'completed') {
              const badgeTypes = ['participant', 'achievement'];
              const badgeType = badgeTypes[Math.floor(Math.random() * badgeTypes.length)];
              
              const badge = await Badge.create({
                userId: participant._id,
                eventId: event._id,
                type: badgeType,
                name: badgeType === 'participant' ? 'Event Participation' : 'Outstanding Achievement',
                description: badgeType === 'participant' 
                  ? `Participated in ${event.title}` 
                  : `Recognized for outstanding achievement in ${event.title}`,
                iconUrl: `https://ui-avatars.com/api/?name=${badgeType}&background=random`,
                awardedAt: new Date(endAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000)
              });
              
              console.log(`✅ Awarded ${badgeType} badge to ${participant.email} for event ${event.title}`);
            }
          } else {
            console.log(`ℹ️  Participant ${participant.email} already registered for event ${event.title}`);
          }
        }
      }
    }

    console.log('\n🔑 Test credentials:');
    console.log('  Participants:');
    for (let i = 1; i <= 10; i++) {
      console.log(`  Email: participant${i.toString().padStart(2, '0')}@example.com | Password: ${password}`);
    }
    console.log('  Organizers:');
    for (let i = 1; i <= 5; i++) {
      console.log(`  Email: organizer${i.toString().padStart(2, '0')}@example.com | Password: ${password}`);
    }

    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('📡 MongoDB connection closed');
  }
}

// Run the main function
main();