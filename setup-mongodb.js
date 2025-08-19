import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function setupMongoDB() {
  console.log('🎯 Complete MongoDB Setup for Ignitia Project');
  console.log('==============================================\n');

  const uri = process.env.DATABASE_URL;
  
  if (!uri) {
    console.error('❌ DATABASE_URL is not set in .env file');
    console.log('Please add your MongoDB Atlas connection string to .env file:');
    console.log('DATABASE_URL=mongodb+srv://username:password@cluster0.ordetpq.mongodb.net/Ignitia?retryWrites=true&w=majority&appName=Cluster0');
    return false;
  }

  console.log('🔗 Connecting to MongoDB Atlas...');
  console.log('URI:', uri.replace(/:[^:@]*@/, ':***@'));

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    const db = client.db('Ignitia');
    console.log('📊 Using database: Ignitia');
    
    // Collections to create
    const collections = [
      'users', 'organizations', 'events', 'teams', 'teammembers',
      'eventregistrations', 'submissions', 'badges', 'certificates',
      'eventrounds', 'evaluations', 'organizationfollowers',
      'userconnections', 'announcements', 'qathreads', 'qareplies'
    ];
    
    console.log('\n📦 Setting up collections...');
    
    // Get existing collections
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);
    
    for (const collectionName of collections) {
      if (!existingNames.includes(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`  ✅ Created collection: ${collectionName}`);
      } else {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`  ℹ️  Collection exists: ${collectionName} (${count} documents)`);
      }
    }
    
    console.log('\n🔍 Creating indexes for performance...');
    
    // User indexes
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ globalPoints: -1 });
    console.log('  ✅ User indexes created');
    
    // Organization indexes
    await db.collection('organizations').createIndex({ handle: 1 }, { unique: true });
    await db.collection('organizations').createIndex({ createdById: 1 });
    console.log('  ✅ Organization indexes created');
    
    // Event indexes
    await db.collection('events').createIndex({ organizationId: 1 });
    await db.collection('events').createIndex({ status: 1 });
    await db.collection('events').createIndex({ createdAt: -1 });
    await db.collection('events').createIndex({ startAt: 1 });
    console.log('  ✅ Event indexes created');
    
    // Team indexes
    await db.collection('teams').createIndex({ eventId: 1 });
    await db.collection('teams').createIndex({ leaderId: 1 });
    await db.collection('teams').createIndex({ inviteCode: 1 }, { unique: true, sparse: true });
    console.log('  ✅ Team indexes created');
    
    // Team member indexes
    await db.collection('teammembers').createIndex({ teamId: 1 });
    await db.collection('teammembers').createIndex({ userId: 1 });
    await db.collection('teammembers').createIndex({ teamId: 1, userId: 1 }, { unique: true });
    console.log('  ✅ Team member indexes created');
    
    // Registration indexes
    await db.collection('eventregistrations').createIndex({ eventId: 1 });
    await db.collection('eventregistrations').createIndex({ userId: 1 });
    await db.collection('eventregistrations').createIndex({ eventId: 1, userId: 1 }, { unique: true });
    console.log('  ✅ Event registration indexes created');
    
    // Submission indexes
    await db.collection('submissions').createIndex({ eventId: 1 });
    await db.collection('submissions').createIndex({ teamId: 1 });
    await db.collection('submissions').createIndex({ roundId: 1 });
    await db.collection('submissions').createIndex({ submittedAt: -1 });
    console.log('  ✅ Submission indexes created');
    
    // Social feature indexes
    await db.collection('userconnections').createIndex({ followerId: 1 });
    await db.collection('userconnections').createIndex({ followingId: 1 });
    await db.collection('userconnections').createIndex({ followerId: 1, followingId: 1 }, { unique: true });
    
    await db.collection('organizationfollowers').createIndex({ userId: 1 });
    await db.collection('organizationfollowers').createIndex({ organizationId: 1 });
    await db.collection('organizationfollowers').createIndex({ userId: 1, organizationId: 1 }, { unique: true });
    console.log('  ✅ Social feature indexes created');
    
    // Badge and certificate indexes
    await db.collection('badges').createIndex({ userId: 1 });
    await db.collection('badges').createIndex({ eventId: 1 });
    await db.collection('badges').createIndex({ awardedAt: -1 });
    
    await db.collection('certificates').createIndex({ userId: 1 });
    await db.collection('certificates').createIndex({ eventId: 1 });
    await db.collection('certificates').createIndex({ issuedAt: -1 });
    console.log('  ✅ Badge and certificate indexes created');
    
    // Q&A indexes
    await db.collection('qathreads').createIndex({ eventId: 1 });
    await db.collection('qathreads').createIndex({ authorId: 1 });
    await db.collection('qathreads').createIndex({ createdAt: -1 });
    
    await db.collection('qareplies').createIndex({ threadId: 1 });
    await db.collection('qareplies').createIndex({ authorId: 1 });
    await db.collection('qareplies').createIndex({ createdAt: -1 });
    console.log('  ✅ Q&A indexes created');
    
    // Announcement indexes
    await db.collection('announcements').createIndex({ eventId: 1 });
    await db.collection('announcements').createIndex({ authorId: 1 });
    await db.collection('announcements').createIndex({ createdAt: -1 });
    console.log('  ✅ Announcement indexes created');
    
    // Event round indexes
    await db.collection('eventrounds').createIndex({ eventId: 1 });
    await db.collection('eventrounds').createIndex({ roundNumber: 1 });
    await db.collection('eventrounds').createIndex({ startAt: 1 });
    console.log('  ✅ Event round indexes created');
    
    // Evaluation indexes
    await db.collection('evaluations').createIndex({ submissionId: 1 });
    await db.collection('evaluations').createIndex({ roundId: 1 });
    await db.collection('evaluations').createIndex({ evaluatorId: 1 });
    await db.collection('evaluations').createIndex({ evaluatedAt: -1 });
    console.log('  ✅ Evaluation indexes created');
    
    // Display final status
    console.log('\n📊 Final Database Status:');
    const finalCollections = await db.listCollections().toArray();
    
    for (const collection of finalCollections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  📁 ${collection.name}: ${count} documents`);
    }
    
    console.log('\n🎉 MongoDB setup completed successfully!');
    console.log('✨ Your Ignitia database is ready for use!');
    console.log('🔗 Database: Ignitia on MongoDB Atlas');
    console.log('📦 Collections: ' + finalCollections.length);
    console.log('🔍 Indexes: Optimized for performance');
    
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.log('\n🔧 Authentication Error - Fix your MongoDB Atlas credentials:');
      console.log('1. Go to https://cloud.mongodb.com/');
      console.log('2. Select your cluster');
      console.log('3. Database Access → Database Users');
      console.log('4. Edit user "arsansk09" or create new user');
      console.log('5. Set correct password (special chars need URL encoding)');
      console.log('6. Ensure user has "readWrite" access to "Ignitia" database');
      console.log('7. Network Access → Add IP 0.0.0.0/0 (allow all IPs for dev)');
      console.log('8. Update .env with correct connection string');
    }
    
    return false;
  } finally {
    await client.close();
  }
}

// Run setup
setupMongoDB().then((success) => {
  if (success) {
    console.log('\n✅ You can now run: npm run dev');
    console.log('🚀 Your project should start without database errors!');
  } else {
    console.log('\n❌ Please fix the issues above and try again.');
  }
  process.exit(success ? 0 : 1);
});
