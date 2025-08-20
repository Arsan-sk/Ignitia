import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { connectMongoDB, User as MongoUser, Organization as MongoOrganization } from '../server/mongodb.js';

dotenv.config();

async function main() {
  console.log('🚀 Seeding test users...');
  await connectMongoDB();

  const password = 'password123';
  const hashed = await bcrypt.hash(password, 10);

  const users = [
    {
      username: 'admin_user',
      email: 'admin@example.com',
      password: hashed,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true,
      university: 'Ignitia University',
    },
    {
      username: 'org_owner',
      email: 'organizer@example.com',
      password: hashed,
      firstName: 'Olivia',
      lastName: 'Organizer',
      role: 'organizer',
      isVerified: true,
      university: 'Ignitia University',
    },
    {
      username: 'participant_one',
      email: 'participant1@example.com',
      password: hashed,
      firstName: 'Peter',
      lastName: 'Participant',
      role: 'participant',
      isVerified: true,
      university: 'Ignitia University',
    },
    {
      username: 'participant_two',
      email: 'participant2@example.com',
      password: hashed,
      firstName: 'Paula',
      lastName: 'Participant',
      role: 'participant',
      isVerified: false,
      university: 'Ignitia University',
    },
  ];

  const results: any[] = [];
  for (const u of users) {
    const existing = await MongoUser.findOne({ email: u.email });
    if (existing) {
      console.log(`ℹ️  User already exists: ${u.email} (id=${existing._id})`);
      results.push(existing);
      continue;
    }
    const doc = await MongoUser.create(u);
    console.log(`✅ Created user: ${u.email} (id=${doc._id})`);
    results.push(doc);
  }

  // Ensure an example organization owned by organizer exists
  const organizer = await MongoUser.findOne({ email: 'organizer@example.com' });
  if (organizer) {
    const existingOrg = await MongoOrganization.findOne({ handle: 'ignitia-org' });
    if (!existingOrg) {
      const org = await MongoOrganization.create({
        name: 'Ignitia Org',
        handle: 'ignitia-org',
        description: 'Demo organization for testing',
        createdById: organizer._id,
        isVerified: true,
      });
      console.log(`✅ Created organization: ${org.name} (id=${org._id})`);
    } else {
      console.log(`ℹ️  Organization exists: ${existingOrg.name} (id=${existingOrg._id})`);
    }
  }

  console.log('\n🔑 Test credentials:');
  console.log('  Email: admin@example.com | Password: password123');
  console.log('  Email: organizer@example.com | Password: password123');
  console.log('  Email: participant1@example.com | Password: password123');
  console.log('  Email: participant2@example.com | Password: password123');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

