import { PrismaClient } from '@prisma/client';

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
    // Test the connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check database schema
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public';`;
    console.log('Database tables available:', tables);
    
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
  console.log('Database disconnected');
});