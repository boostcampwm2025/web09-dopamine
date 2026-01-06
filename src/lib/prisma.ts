/**
 * Prisma Client 싱글톤 인스턴스
 * 
 * Next.js의 Hot Reload 환경에서 PrismaClient가 여러 번 생성되는 것을 방지하기 위해
 * globalThis에 인스턴스를 저장합니다.
 * 
 * 데이터베이스 연결 정보는 prisma.config.ts에서 관리되며,
 * DATABASE_URL 환경변수를 통해 MySQL에 연결됩니다.
 */

import { PrismaClient } from '@prisma/client';

// globalThis에 prisma 인스턴스를 저장하기 위한 타입 정의
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 이미 생성된 인스턴스가 있으면 재사용, 없으면 새로 생성
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// 개발 환경에서만 globalThis에 인스턴스 저장 (프로덕션에서는 불필요)
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
