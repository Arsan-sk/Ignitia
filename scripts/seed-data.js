import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { connectMongoDB, User as MongoUser, Organization as MongoOrganization, Event as MongoEvent, EventRegistration as MongoEventRegistration, Badge as MongoBadge } from '../server/mongodb';
import mongoose from 'mongoose';

dotenv.config();

async function main() {
  console.log('🚀 Seeding database with users, organizations, and events...');
  await connectMongoDB();

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

    const existing = await MongoUser.findOne({ email: userData.email });
    if (existing) {
      console.log(`ℹ️  User already exists: ${userData.email} (id=${existing._id})`);
      participants.push(existing);
      continue;
    }
    const doc = await MongoUser.create(userData);
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

    const existing = await MongoUser.findOne({ email: userData.email });
    if (existing) {
      console.log(`ℹ️  User already exists: ${userData.email} (id=${existing._id})`);
      organizers.push(existing);
      continue;
    }
    const doc = await MongoUser.create(userData);
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

    const existingOrg = await MongoOrganization.findOne({ handle: orgData.handle });
    if (existingOrg) {
      console.log(`ℹ️  Organization exists: ${existingOrg.name} (id=${existingOrg._id})`);
      organizations.push(existingOrg);
      continue;
    }
    const org = await MongoOrganization.create(orgData);
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

      const existingEvent = await MongoEvent.findOne({ 
        title: eventData.title, 
        organizationId: org._id 
      });
      
      if (existingEvent) {
        console.log(`ℹ️  Event exists: ${existingEvent.title} (id=${existingEvent._id})`);
        events.push(existingEvent);
        continue;
      }
      
      const event = await MongoEvent.create(eventData);
      console.log(`✅ Created event: ${event.title} (id=${event._id})`);
      events.push(event);
      
      // Register some participants for this event
      const numParticipantsToRegister = Math.floor(Math.random() * participants.length);
      const shuffledParticipants = [...participants].sort(() => 0.5 - Math.random());
      
      for (let k = 0; k < numParticipantsToRegister; k++) {
        const participant = shuffledParticipants[k];
        
        const existingRegistration = await MongoEventRegistration.findOne({
          eventId: event._id,
          userId: participant._id
        });
        
        if (!existingRegistration) {
          const registration = await MongoEventRegistration.create({
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
            
            const badge = await MongoBadge.create({
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

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});