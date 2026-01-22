import { IssueStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { PrismaTransaction } from '@/types/prisma';

type PrismaClientOrTx = PrismaTransaction | typeof prisma;

export async function createIssue(tx: PrismaTransaction, title: string, topicId?: string) {
  if (topicId) {
    // 이슈랑 이슈노드 함께 만들기
    return tx.issue.create({
      data: {
        title,
        topicId,
        issueNode: {
          create: {
            positionX: 500,
            positionY: 400,
          },
        },
      },
    });
  }
  return tx.issue.create({
    data: {
      title,
    },
  });
}

export async function findIssueById(issueId: string) {
  return prisma.issue.findFirst({
    where: {
      id: issueId,
      deletedAt: null,
    },
    select: {
      title: true,
      status: true,
      topicId: true,
    },
  });
}

export async function updateIssueStatus(
  issueId: string,
  status: IssueStatus,
  tx?: PrismaTransaction,
) {
  // 트랜잭션이 제공되면 그것을 사용하고, 그렇지 않으면 기본 prisma 클라이언트를 사용합니다.
  const client: PrismaClientOrTx = tx ?? prisma;

  return client.issue.update({
    where: { id: issueId },
    data: {
      status,
      closedAt: status === IssueStatus.CLOSE ? new Date() : null,
    },
    select: {
      id: true,
      status: true,
    },
  });
}

export async function findIssuesWithMapDataByTopicId(topicId: string) {
  const issues = await prisma.issue.findMany({
    where: {
      topicId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      issueNode: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          positionX: true,
          positionY: true,
        },
      },
    },
  });

  const connections = await prisma.issueConnection.findMany({
    where: {
      deletedAt: null,
      sourceIssue: {
        topicId,
        deletedAt: null,
      },
      targetIssue: {
        topicId,
        deletedAt: null,
      },
    },
    select: {
      id: true,
      sourceIssueId: true,
      targetIssueId: true,
      sourceHandle: true,
      targetHandle: true,
    },
  });

  return {
    issues,
    connections,
  };
}
