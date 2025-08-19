import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  // Try different encoding approaches for the password
  const password = '@Arsan04';
  const encodedPassword = encodeURIComponent(password);
  
  console.log('Original password contains:', password);
  console.log('URL encoded password:', encodedPassword);
  
  // Test multiple connection strings
  const connectionStrings = [
    // From environment
    process.env.DATABASE_URL,
    // With different encoding
    `mongodb+srv://arsansk09:${encodedPassword}@cluster0.ordetpq.mongodb.net/Ignitia?retryWrites=true&w=majority&appName=Cluster0`,
    // Alternative format
    `mongodb+srv://arsansk09:${encodedPassword}@cluster0.ordetpq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  ];
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const uri = connectionStrings[i];
    console.log(`\n--- Attempt ${i + 1} ---`);
    console.log('Testing connection with URI:', uri ? uri.replace(/:[^:@]*@/, ':***@') : 'undefined');
    
    if (!uri) {
      console.log('❌ URI is undefined, skipping...');
      continue;
    }
    
    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      console.log('✅ Successfully connected to MongoDB!');
      
      const db = client.db('Ignitia');
      const collections = await db.listCollections().toArray();
      console.log('📦 Available collections:', collections.map(c => c.name));
      
      await client.close();
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      try {
        await client.close();
      } catch (closeError) {
        // Ignore close errors
      }
    }
  }
  
  return false;
}

testConnection();
