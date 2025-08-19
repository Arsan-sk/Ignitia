import { connectMongoDB } from './server/mongodb.js';
import {
  User, Organization, Event, Team, TeamMember, EventRegistration,
  Submission, Badge, Certificate, EventRound, Evaluation, 
  OrganizationFollower, UserConnection, Announcement, QAThread, QAReply
} from './server/mongodb.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateMongoDB() {
  console.log('🚀 Starting MongoDB migration...');
  
  try {
    // Connect to MongoDB
    await connectMongoDB();
    console.log('✅ Connected to MongoDB');
    
    // List of all models to ensure collections are created
    const models = [
      { name: 'User', model: User },
      { name: 'Organization', model: Organization },
      { name: 'Event', model: Event },
      { name: 'Team', model: Team },
      { name: 'TeamMember', model: TeamMember },
      { name: 'EventRegistration', model: EventRegistration },
      { name: 'Submission', model: Submission },
      { name: 'Badge', model: Badge },
      { name: 'Certificate', model: Certificate },
      { name: 'EventRound', model: EventRound },
      { name: 'Evaluation', model: Evaluation },
      { name: 'OrganizationFollower', model: OrganizationFollower },
      { name: 'UserConnection', model: UserConnection },
      { name: 'Announcement', model: Announcement },
      { name: 'QAThread', model: QAThread },
      { name: 'QAReply', model: QAReply }
    ];
    
    console.log('📦 Creating collections and indexes...');
    
    for (const { name, model } of models) {
      try {
        // Create the collection if it doesn't exist
        await model.createCollection();
        console.log(`  ✅ ${name} collection ready`);
        
        // Ensure indexes are created
        await model.createIndexes();
        console.log(`  📊 ${name} indexes created`);
        
        // Get collection stats
        const count = await model.countDocuments();
        console.log(`  📈 ${name} collection has ${count} documents`);
        
      } catch (error) {
        // Collection might already exist, that's okay
        if (error.codeName === 'NamespaceExists' || error.code === 48) {
          console.log(`  ℹ️  ${name} collection already exists`);
          const count = await model.countDocuments();
          console.log(`  📈 ${name} collection has ${count} documents`);
        } else {
          console.error(`  ❌ Error with ${name}:`, error.message);
        }
      }
    }
    
    // Create additional indexes for performance
    console.log('🔍 Creating additional indexes...');
    
    // User indexes
    await User.createIndex({ username: 1 }, { unique: true });
    await User.createIndex({ email: 1 }, { unique: true });
    await User.createIndex({ globalPoints: -1 });
    
    // Event indexes
    await Event.createIndex({ organizationId: 1 });
    await Event.createIndex({ status: 1 });
    await Event.createIndex({ createdAt: -1 });
    await Event.createIndex({ startAt: 1 });
    
    // Team indexes
    await Team.createIndex({ eventId: 1 });
    await Team.createIndex({ leaderId: 1 });
    await Team.createIndex({ inviteCode: 1 }, { unique: true, sparse: true });
    
    // Registration indexes
    await EventRegistration.createIndex({ eventId: 1, userId: 1 }, { unique: true });
    await EventRegistration.createIndex({ userId: 1 });
    
    // Submission indexes
    await Submission.createIndex({ eventId: 1 });
    await Submission.createIndex({ teamId: 1 });
    await Submission.createIndex({ submittedAt: -1 });
    
    // Social feature indexes
    await UserConnection.createIndex({ followerId: 1, followingId: 1 }, { unique: true });
    await OrganizationFollower.createIndex({ userId: 1, organizationId: 1 }, { unique: true });
    
    console.log('✅ Additional indexes created');
    
    // Display final status
    console.log('\n🎉 MongoDB migration completed successfully!');
    console.log('\n📊 Final Collection Status:');
    
    for (const { name, model } of models) {
      const count = await model.countDocuments();
      console.log(`  ${name}: ${count} documents`);
    }
    
    console.log('\n✨ Your MongoDB Atlas database is ready for use!');
    console.log('🔗 Database Name: Ignitia');
    console.log('🌟 All collections and indexes have been set up');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the connection
    process.exit(0);
  }
}

// Run migration
migrateMongoDB();
