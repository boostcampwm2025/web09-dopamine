import { IssueRole, IssueStatus } from '@prisma/client';
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
  const issue = await prisma.issue.findFirst({
    where: {
      id: issueId,
      deletedAt: null,
    },
    select: {
      title: true,
      status: true,
      topicId: true,
      topic: {
        select: {
          projectId: true,
        },
      },
    },
  });

  if (!issue) {
    return null;
  }

  return {
    title: issue.title,
    status: issue.status,
    topicId: issue.topicId,
    projectId: issue.topic?.projectId ?? null,
  };
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

export async function findIssueWithPermissionData(issueId: string, userId: string) {
  return await prisma.issue.findUnique({
    where: { id: issueId, deletedAt: null },
    select: {
      topicId: true,
      issueMembers: {
        where: { userId, role: IssueRole.OWNER },
        select: { id: true },
      },
      topic: {
        select: {
          project: {
            select: {
              projectMembers: {
                where: { userId },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });
}

export async function updateIssueTitle(issueId: string, title: string) {
  return await prisma.issue.update({
    where: { id: issueId },
    data: { title },
    select: { id: true, title: true, topicId: true },
  });
}

export async function softDeleteIssue(issueId: string) {
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    // 아이디어 삭제
    await tx.idea.updateMany({
      where: { issueId, deletedAt: null },
      data: { deletedAt: now },
    });

    // 카테고리 삭제
    await tx.category.updateMany({
      where: { issueId, deletedAt: null },
      data: { deletedAt: now },
    });

    // 이슈 멤버 삭제
    await tx.issueMember.updateMany({
      where: { issueId, deletedAt: null },
      data: { deletedAt: now },
    });

    // 이슈 노드 삭제
    await tx.issueNode.updateMany({
      where: { issueId, deletedAt: null },
      data: { deletedAt: now },
    });

    // 이슈 삭제
    return await tx.issue.update({
      where: { id: issueId },
      data: { deletedAt: now },
      select: { id: true, topicId: true },
    });
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
