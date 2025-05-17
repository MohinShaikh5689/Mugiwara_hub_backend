import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';

// Initialize Prisma Client with retries
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
};

// Create global variable for PrismaClient
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export const connectToDB = async () => {
  try {
    // Test the Prisma connection
    await prisma.$connect();
    console.log('✅ PostgreSQL Database connected successfully');
    
    // Check PostgreSQL database schema
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public';`;
    console.log('PostgreSQL tables available:', tables);
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('❌ MongoDB connection failed: MONGO_URI environment variable not set');
      return false;
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
    
    // Get MongoDB collections
    if (!mongoose.connection.db) {
      console.error('❌ MongoDB connection failed: Database instance is undefined');
      return false;
    }
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('MongoDB collections available:', collections.map(col => col.name));
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    // Retry logic can be implemented here
    return false;
  }
};

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await mongoose.disconnect();
  console.log('Databases disconnected');
});