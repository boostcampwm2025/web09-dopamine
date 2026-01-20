import { prisma } from '@/lib/prisma';
import { PrismaTransaction } from '@/types/prisma';
import { ReportWithDetails } from '@/types/report';

type PrismaClientOrTx = PrismaTransaction | typeof prisma;

export async function findReportByIssueId(issueId: string, tx?: PrismaTransaction) {
  const client: PrismaClientOrTx = tx ?? prisma;

  return client.report.findFirst({
    where: {
      issueId,
      deletedAt: null,
    },
  });
}

export async function createReport(
  issueId: string,
  selectedIdeaId: string | null,
  memo: string | null,
  tx?: PrismaTransaction,
) {
  const client: PrismaClientOrTx = tx ?? prisma;

  return client.report.create({
    data: {
      issueId,
      selectedIdeaId: selectedIdeaId,
      memo: memo,
    },
  });
}

// 필요한 정보를 포함한 리포트 조회
export async function findReportWithDetailsById(
  issueId: string,
  tx?: PrismaTransaction,
): Promise<ReportWithDetails | null> {
  const client: PrismaClientOrTx = tx ?? prisma;

  return client.report.findFirst({
    where: {
      issueId,
      deletedAt: null,
    },
    include: {
      // 이슈 조인
      issue: {
        select: {
          id: true,
          title: true,
          // 이슈 멤버스 조인 (참가자 수 계산용)
          issueMembers: {
            where: { deletedAt: null },
            select: {
              id: true,
              userId: true,
              deletedAt: true,
            },
          },
          // 아이디어 조인
          ideas: {
            where: { deletedAt: null },
            select: {
              id: true,
              content: true,
              votes: {
                where: { deletedAt: null },
                select: { id: true, type: true },
              },
              comments: {
                where: { deletedAt: null },
                select: { id: true, content: true },
              },
              // 카테고리 정보
              category: {
                select: {
                  id: true,
                  title: true,
                },
              },
              // 아이디어 작성자 정보
              user: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  image: true,
                },
              },
            },
          },
        },
      },
      // 선택된 아이디어 조인
      selectedIdea: {
        select: {
          id: true,
          content: true,
          votes: {
            where: { deletedAt: null },
            select: { id: true, type: true },
          },
          comments: {
            where: { deletedAt: null },
            select: { id: true },
          },
          category: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      // wordClouds: {
      //   where: { deletedAt: null },
      //   orderBy: { count: 'desc' },
      // },
    },
  });
}
