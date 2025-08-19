import { MongoClient } from 'mongodb';

console.log('🎯 Temporary MongoDB Setup');
console.log('===========================\n');

console.log('Since the current credentials are not working, let\'s set up with simple credentials:');
console.log('\n📋 STEP 1: Create New Database User in MongoDB Atlas');
console.log('1. Go to https://cloud.mongodb.com/');
console.log('2. Select your cluster: cluster0.ordetpq.mongodb.net');
console.log('3. Database Access → Add New Database User');
console.log('4. Username: ignitia_dev');
console.log('5. Password: ignitia123 (simple, no special chars)');
console.log('6. Database User Privileges: "readWrite" to "Ignitia" database');
console.log('7. Add User');

console.log('\n🌐 STEP 2: Network Access');
console.log('1. Network Access → IP Access List');
console.log('2. Add IP Address → Allow access from anywhere (0.0.0.0/0)');
console.log('3. Confirm');

console.log('\n📝 STEP 3: Update .env file');
console.log('Replace your DATABASE_URL with:');
console.log('DATABASE_URL=mongodb+srv://ignitia_dev:ignitia123@cluster0.ordetpq.mongodb.net/Ignitia?retryWrites=true&w=majority&appName=Cluster0');

console.log('\n🧪 STEP 4: Test Connection');
console.log('After creating the user, test with:');

// Test function that can be called after user creates the credentials
async function testSimpleConnection() {
  const simpleConnectionString = 'mongodb+srv://ignitia_dev:ignitia123@cluster0.ordetpq.mongodb.net/Ignitia?retryWrites=true&w=majority&appName=Cluster0';
  
  console.log('\n🔗 Testing simple credentials...');
  console.log('URI:', simpleConnectionString.replace(/:([^@]*@)/, ':***@'));
  
  const client = new MongoClient(simpleConnectionString);
  
  try {
    await client.connect();
    console.log('✅ CONNECTION SUCCESSFUL!');
    
    const db = client.db('Ignitia');
    const collections = await db.listCollections().toArray();
    console.log(`📦 Collections: ${collections.length}`);
    
    await client.close();
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

console.log('\n💡 Alternative: Use MongoDB Compass');
console.log('1. Download MongoDB Compass');
console.log('2. Use connection string to connect and verify credentials');
console.log('3. Create collections manually if needed');

console.log('\n🚨 Current Issue Analysis:');
console.log('The "bad auth : authentication failed" error suggests:');
console.log('- User "arsansk09" may not exist');
console.log('- Password "@Arsan04" may be incorrect');  
console.log('- User may not have proper permissions');
console.log('- Database "Ignitia" access may be restricted');

console.log('\n🎯 Next Steps:');
console.log('1. Create the simple user above');
console.log('2. Update .env file');  
console.log('3. Run: npm run mongodb:check');
console.log('4. Run: npm run mongodb:setup');
console.log('5. Run: npm run dev');

// Export the test function for use
export { testSimpleConnection };
