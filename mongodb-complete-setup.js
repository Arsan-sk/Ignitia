import { MongoClient } from 'mongodb';
import { connectMongoDB } from './server/mongodb.js';
import dotenv from 'dotenv';

dotenv.config();

async function completeMongoDBSetup() {
  console.log('🚀 Complete MongoDB Setup and Database Migration');
  console.log('==================================================\n');

  const uri = process.env.DATABASE_URL;
  
  if (!uri) {
    console.error('❌ DATABASE_URL is not set in .env file');
    console.log('Please set DATABASE_URL in your .env file and try again.');
    return false;
  }

  console.log('🔗 Connection String:', uri.replace(/:[^:@]*@/, ':***@'));

  try {
    // Test connection first
    console.log('1️⃣ Testing MongoDB Atlas connection...');
    await connectMongoDB();
    console.log('✅ MongoDB connection successful!');

    // Setup database collections and indexes
    console.log('\n2️⃣ Setting up database collections...');
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('Ignitia');

    // Define all collections with their optimal indexes
    const collections = [
      {
        name: 'users',
        indexes: [
          { key: { username: 1 }, options: { unique: true } },
          { key: { email: 1 }, options: { unique: true } },
          { key: { globalPoints: -1 }, options: {} }
        ]
      },
      {
        name: 'organizations', 
        indexes: [
          { key: { handle: 1 }, options: { unique: true } },
          { key: { createdById: 1 }, options: {} }
        ]
      },
      {
        name: 'events',
        indexes: [
          { key: { organizationId: 1 }, options: {} },
          { key: { status: 1 }, options: {} },
          { key: { createdAt: -1 }, options: {} },
          { key: { startAt: 1 }, options: {} }
        ]
      },
      {
        name: 'teams',
        indexes: [
          { key: { eventId: 1 }, options: {} },
          { key: { leaderId: 1 }, options: {} },
          { key: { inviteCode: 1 }, options: { unique: true, sparse: true } }
        ]
      },
      {
        name: 'teammembers',
        indexes: [
          { key: { teamId: 1 }, options: {} },
          { key: { userId: 1 }, options: {} },
          { key: { teamId: 1, userId: 1 }, options: { unique: true } }
        ]
      },
      {
        name: 'eventregistrations',
        indexes: [
          { key: { eventId: 1 }, options: {} },
          { key: { userId: 1 }, options: {} },
          { key: { eventId: 1, userId: 1 }, options: { unique: true } }
        ]
      },
      {
        name: 'submissions',
        indexes: [
          { key: { eventId: 1 }, options: {} },
          { key: { teamId: 1 }, options: {} },
          { key: { roundId: 1 }, options: {} },
          { key: { submittedAt: -1 }, options: {} }
        ]
      },
      {
        name: 'badges',
        indexes: [
          { key: { userId: 1 }, options: {} },
          { key: { eventId: 1 }, options: {} },
          { key: { awardedAt: -1 }, options: {} }
        ]
      },
      {
        name: 'certificates',
        indexes: [
          { key: { userId: 1 }, options: {} },
          { key: { eventId: 1 }, options: {} },
          { key: { issuedAt: -1 }, options: {} }
        ]
      },
      {
        name: 'eventrounds',
        indexes: [
          { key: { eventId: 1 }, options: {} },
          { key: { roundNumber: 1 }, options: {} },
          { key: { startAt: 1 }, options: {} }
        ]
      },
      {
        name: 'evaluations',
        indexes: [
          { key: { submissionId: 1 }, options: {} },
          { key: { roundId: 1 }, options: {} },
          { key: { evaluatorId: 1 }, options: {} },
          { key: { evaluatedAt: -1 }, options: {} }
        ]
      },
      {
        name: 'userconnections',
        indexes: [
          { key: { followerId: 1 }, options: {} },
          { key: { followingId: 1 }, options: {} },
          { key: { followerId: 1, followingId: 1 }, options: { unique: true } }
        ]
      },
      {
        name: 'organizationfollowers',
        indexes: [
          { key: { userId: 1 }, options: {} },
          { key: { organizationId: 1 }, options: {} },
          { key: { userId: 1, organizationId: 1 }, options: { unique: true } }
        ]
      },
      {
        name: 'announcements',
        indexes: [
          { key: { eventId: 1 }, options: {} },
          { key: { authorId: 1 }, options: {} },
          { key: { createdAt: -1 }, options: {} }
        ]
      },
      {
        name: 'qathreads',
        indexes: [
          { key: { eventId: 1 }, options: {} },
          { key: { authorId: 1 }, options: {} },
          { key: { createdAt: -1 }, options: {} }
        ]
      },
      {
        name: 'qareplies',
        indexes: [
          { key: { threadId: 1 }, options: {} },
          { key: { authorId: 1 }, options: {} },
          { key: { createdAt: -1 }, options: {} }
        ]
      }
    ];

    // Create collections and indexes
    let createdCount = 0;
    let existingCount = 0;

    for (const collectionDef of collections) {
      try {
        const collection = db.collection(collectionDef.name);
        
        // Check if collection exists
        const exists = await db.listCollections({ name: collectionDef.name }).hasNext();
        
        if (!exists) {
          await db.createCollection(collectionDef.name);
          console.log(`  ✅ Created: ${collectionDef.name}`);
          createdCount++;
        } else {
          existingCount++;
          console.log(`  ℹ️  Exists: ${collectionDef.name}`);
        }

        // Create indexes
        for (const indexDef of collectionDef.indexes) {
          try {
            await collection.createIndex(indexDef.key, indexDef.options);
          } catch (indexError) {
            // Index might already exist, that's okay
            if (!indexError.message.includes('already exists')) {
              console.log(`    ⚠️ Index warning for ${collectionDef.name}:`, indexError.message);
            }
          }
        }
        
        console.log(`    🔍 Created ${collectionDef.indexes.length} indexes for ${collectionDef.name}`);
        
      } catch (error) {
        console.error(`  ❌ Error with ${collectionDef.name}:`, error.message);
      }
    }

    console.log(`\n📊 Collection Summary:`);
    console.log(`  ✅ Created: ${createdCount} collections`);
    console.log(`  ℹ️  Existing: ${existingCount} collections`);
    console.log(`  📝 Total: ${collections.length} collections`);

    // Display final database status
    console.log('\n3️⃣ Final Database Status:');
    const finalCollections = await db.listCollections().toArray();
    
    for (const collection of finalCollections) {
      const count = await db.collection(collection.name).countDocuments();
      const indexes = await db.collection(collection.name).listIndexes().toArray();
      console.log(`  📁 ${collection.name}: ${count} documents, ${indexes.length} indexes`);
    }

    await client.close();

    console.log('\n🎉 MongoDB Setup Complete!');
    console.log('✨ Your Ignitia database is fully configured');
    console.log('🔗 Database: Ignitia on MongoDB Atlas');
    console.log('📦 Collections: ' + finalCollections.length);
    console.log('🔍 Optimized indexes for all collections');
    
    return true;

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.log('\n🔧 MongoDB Atlas Credential Issues:');
      console.log('Current connection string format appears correct, but authentication is failing.');
      console.log('\nPlease verify in MongoDB Atlas:');
      console.log('1. User "arsansk09" exists');
      console.log('2. Password is exactly "@Arsan04"');
      console.log('3. User has "readWrite" permissions to "Ignitia" database');
      console.log('4. Your IP is whitelisted (Network Access)');
      console.log('\nOr create a simple test user:');
      console.log('- Username: ignitia_dev');
      console.log('- Password: ignitia123');
      console.log('- Update .env: DATABASE_URL=mongodb+srv://ignitia_dev:ignitia123@cluster0.ordetpq.mongodb.net/Ignitia?retryWrites=true&w=majority&appName=Cluster0');
    }
    
    return false;
  }
}

// Run the complete setup
completeMongoDBSetup().then((success) => {
  if (success) {
    console.log('\n🚀 Ready to start your server!');
    console.log('Run: npm run dev');
    console.log('\n🎯 Your project is now connected to MongoDB Atlas');
    console.log('📝 You can now test user registration and other features');
  } else {
    console.log('\n❌ Please fix the MongoDB Atlas credentials and try again');
    console.log('💡 Check the troubleshooting steps above');
  }
  
  process.exit(success ? 0 : 1);
});
