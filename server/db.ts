import { connectMongoDB } from './mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Initialize MongoDB connection
export const initializeDB = async () => {
  await connectMongoDB();
};

// Legacy export for compatibility (will be replaced by MongoDB storage)
export const db = null;
export const pool = null;
