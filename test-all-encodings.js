import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function testAllEncodings() {
  console.log('🔍 Testing all possible password encodings for @Arsan04');
  console.log('========================================================\n');

  const username = 'arsansk09';
  const originalPassword = '@Arsan04';
  const hostname = 'cluster0.ordetpq.mongodb.net';
  const database = 'Ignitia';
  const params = 'retryWrites=true&w=majority&appName=Cluster0';

  // Different encoding approaches for the password
  const encodingTests = [
    {
      name: 'URL Encoded (@)',
      password: '%40Arsan04'
    },
    {
      name: 'Double URL Encoded',
      password: '%2540Arsan04'
    },
    {
      name: 'Manual encoding',
      password: encodeURIComponent('@Arsan04')
    },
    {
      name: 'Component encoding',
      password: encodeURIComponent(originalPassword)
    },
    {
      name: 'URI encoding',
      password: encodeURI(originalPassword)
    },
    {
      name: 'No encoding (raw)',
      password: '@Arsan04'
    }
  ];

  for (let i = 0; i < encodingTests.length; i++) {
    const { name, password } = encodingTests[i];
    const connectionString = `mongodb+srv://${username}:${password}@${hostname}/${database}?${params}`;
    
    console.log(`\n🧪 Test ${i + 1}: ${name}`);
    console.log(`Password: "${password}"`);
    console.log(`URI: ${connectionString.replace(/:([^@]*@)/, ':***@')}`);
    
    const client = new MongoClient(connectionString, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    try {
      console.log('  ⏳ Connecting...');
      await client.connect();
      console.log('  ✅ CONNECTION SUCCESSFUL! 🎉');
      
      // Test database operations
      const db = client.db(database);
      const collections = await db.listCollections().toArray();
      console.log(`  📦 Collections found: ${collections.length}`);
      
      if (collections.length > 0) {
        console.log(`  📁 Collection names: ${collections.map(c => c.name).join(', ')}`);
      }
      
      // Test write permission
      try {
        const testCollection = db.collection('_connection_test');
        await testCollection.insertOne({ test: true, timestamp: new Date() });
        console.log('  ✅ Write permission: OK');
        await testCollection.deleteOne({ test: true });
        console.log('  ✅ Delete permission: OK');
      } catch (writeError) {
        console.log('  ❌ Write permission: FAILED -', writeError.message);
      }

      await client.close();
      console.log('\n🎯 FOUND WORKING CONNECTION STRING:');
      console.log(`DATABASE_URL=${connectionString}`);
      console.log('\n📝 Update your .env file with the above connection string!');
      return { success: true, connectionString, encoding: name };
      
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      try {
        await client.close();
      } catch (closeError) {
        // Ignore close errors
      }
    }
  }

  console.log('\n💔 All encoding tests failed!');
  console.log('\n🔧 Troubleshooting steps:');
  console.log('1. Check if user "arsansk09" exists in MongoDB Atlas');
  console.log('2. Verify the password is exactly "@Arsan04"');
  console.log('3. Ensure the user has readWrite permissions');
  console.log('4. Check Network Access allows your IP (0.0.0.0/0)');
  console.log('5. Try creating a new user with a simple password');
  
  return { success: false };
}

// Run the test
testAllEncodings().then((result) => {
  if (result.success) {
    console.log(`\n🚀 Ready to proceed with encoding: ${result.encoding}`);
    process.exit(0);
  } else {
    console.log('\n❌ Connection could not be established with any encoding method.');
    process.exit(1);
  }
}).catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
