import { PrismaClient } from '@prisma/client';

// Singleton Prisma Client
let prisma: PrismaClient;

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
};

export const prismaClient = getPrismaClient();

// Export Prisma types
export * from '@prisma/client';
