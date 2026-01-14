import { prisma } from '@/lib/prisma';
import { PrismaTransaction } from '@/types/prisma';

type PrismaClientOrTx = PrismaTransaction | typeof prisma;

/**
 * 워드클라우드 데이터를 저장합니다
 */
export async function createWordClouds(
  reportId: string,
  wordCloudData: Array<{ word: string; count: number }>,
  tx?: PrismaTransaction,
) {
  const client: PrismaClientOrTx = tx ?? prisma;

  // 기존 워드클라우드 데이터 삭제 (soft delete)
  await client.wordCloud.updateMany({
    where: {
      reportId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  // 새로운 워드클라우드 데이터 생성
  return client.wordCloud.createMany({
    data: wordCloudData.map((item) => ({
      reportId,
      word: item.word,
      count: item.count,
    })),
  });
}

/**
 * 리포트 ID로 워드클라우드 데이터를 조회합니다
 */
export async function findWordCloudsByReportId(reportId: string) {
  return prisma.wordCloud.findMany({
    where: {
      reportId,
      deletedAt: null,
    },
    orderBy: {
      count: 'desc',
    },
  });
}

export async function findIssueTextSourcesForWordCloud(issueId: string, tx?: PrismaTransaction) {
  return prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      ideas: {
        where: { deletedAt: null },
        select: {
          content: true,
          comments: {
            where: { deletedAt: null },
            select: { content: true },
          },
        },
      },
    },
  });
}
