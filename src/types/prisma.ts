import { prisma } from '@/lib/prisma';

export type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
