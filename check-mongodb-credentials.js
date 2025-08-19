import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function checkCredentials() {
  console.log('🔍 MongoDB Atlas Credential Checker');
  console.log('=====================================\n');

  // Extract connection details
  const uri = process.env.DATABASE_URL;
  
  if (!uri) {
    console.error('❌ DATABASE_URL is not set in .env file');
    return false;
  }

  console.log('🔗 Connection String Analysis:');
  console.log('URI:', uri.replace(/:[^:@]*@/, ':***@'));

  try {
    // Parse the connection string
    const url = new URL(uri);
    console.log('📋 Parsed Connection Details:');
    console.log('  Protocol:', url.protocol);
    console.log('  Host:', url.hostname);
    console.log('  Username:', url.username);
    console.log('  Database:', url.pathname.replace('/', '') || 'Not specified');
    console.log('  Search Params:', url.searchParams.toString());
    
  } catch (parseError) {
    console.error('❌ Error parsing connection string:', parseError.message);
    return false;
  }

  // Test connection attempts with different approaches
  const testConnections = [
    {
      name: 'Original Connection String',
      uri: uri
    },
    {
      name: 'Without Database Name',
      uri: uri.replace(/\/[^?]*\?/, '/?')
    }
  ];

  for (const { name, uri: testUri } of testConnections) {
    console.log(`\n🧪 Testing: ${name}`);
    console.log('URI:', testUri.replace(/:[^:@]*@/, ':***@'));
    
    const client = new MongoClient(testUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    try {
      await client.connect();
      console.log('✅ Connection successful!');
      
      // Test admin operations
      const admin = client.db().admin();
      const ismaster = await admin.command({ ismaster: 1 });
      console.log('🔐 Authentication successful!');
      console.log('🌍 Connected to:', ismaster.hosts ? ismaster.hosts[0] : 'Unknown host');
      
      // List databases
      const databases = await admin.listDatabases();
      console.log('📚 Available databases:', databases.databases.map(db => db.name).join(', '));
      
      // Check specific database
      const db = client.db('Ignitia');
      const collections = await db.listCollections().toArray();
      console.log('📦 Collections in Ignitia:', collections.length ? collections.map(c => c.name).join(', ') : 'None');
      
      await client.close();
      return true;
      
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      
      // Provide specific troubleshooting advice
      if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
        console.log('\n🔧 Authentication Troubleshooting:');
        console.log('1. ✏️  Check your username and password in MongoDB Atlas');
        console.log('2. 🔒 Ensure the user has proper permissions (readWrite)');
        console.log('3. 🌐 Check if your IP is whitelisted (0.0.0.0/0 for all IPs)');
        console.log('4. 🔑 Try creating a new database user with simple credentials');
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
        console.log('\n🔧 Network Troubleshooting:');
        console.log('1. 🌐 Check your internet connection');
        console.log('2. 🔥 Check firewall settings');
        console.log('3. 🏢 Check if you\'re behind a corporate proxy');
      }
      
      try {
        await client.close();
      } catch (closeError) {
        // Ignore
      }
    }
  }

  return false;
}

// Provide manual credential setup instructions
function provideSetupInstructions() {
  console.log('\n📖 MongoDB Atlas Setup Instructions:');
  console.log('=====================================');
  console.log('1. 🌐 Go to https://cloud.mongodb.com/');
  console.log('2. 🔑 Sign in to your MongoDB Atlas account');
  console.log('3. 📂 Select your cluster (cluster0.ordetpq.mongodb.net)');
  console.log('4. 👤 Go to Database Access → Database Users');
  console.log('5. ✏️  Edit or create user "arsansk09"');
  console.log('6. 🔐 Set a simple password (avoid special characters for now)');
  console.log('7. 🔒 Ensure user has "readWrite" privileges to "Ignitia" database');
  console.log('8. 🌐 Go to Network Access → IP Access List');
  console.log('9. ➕ Add IP Address: 0.0.0.0/0 (allows all IPs - for development)');
  console.log('10. 🔗 Get connection string from Connect → Drivers → Node.js');
  console.log('\n⚠️  For production, use specific IP addresses and strong passwords!');
  
  console.log('\n🔧 Alternative: Create New Credentials');
  console.log('=====================================');
  console.log('1. Create a new database user with username: ignitia_user');
  console.log('2. Set password: ignitia_pass (simple for testing)');
  console.log('3. Update your .env file with:');
  console.log('   DATABASE_URL=mongodb+srv://ignitia_user:ignitia_pass@cluster0.ordetpq.mongodb.net/Ignitia?retryWrites=true&w=majority&appName=Cluster0');
}

// Run the checker
checkCredentials().then((success) => {
  if (!success) {
    provideSetupInstructions();
  }
}).catch((error) => {
  console.error('💥 Unexpected error:', error);
  provideSetupInstructions();
});
