import { prisma } from '@/lib/prisma';

export const createTopic = async (title: string, projectId: string) => {
  return await prisma.$transaction(async (tx) => {
    const topic = await tx.topic.create({
      data: {
        projectId,
        title,
      },
    });

    return {
      id: topic.id,
      title: topic.title,
      projectId: topic.projectId,
      createdAt: topic.createdAt,
    };
  });
};

export const findTopicById = async (topicId: string) => {
  return await prisma.topic.findUnique({
    where: {
      id: topicId,
    },
  });
};

export const findTopicWithPermissionData = async (topicId: string, userId: string) => {
  return await prisma.topic.findUnique({
    where: {
      id: topicId,
      deletedAt: null,
    },
    select: {
      id: true,
      projectId: true,
      project: {
        select: {
          projectMembers: {
            where: { userId },
            select: { id: true },
          },
        },
      },
    },
  });
};

export const updateTopicTitle = async (topicId: string, title: string) => {
  return await prisma.topic.update({
    where: { id: topicId },
    data: { title },
    select: {
      id: true,
      title: true,
    },
  });
};

export async function softDeleteTopic(topicId: string) {
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    const issues = await tx.issue.findMany({
      where: { topicId, deletedAt: null },
      select: { id: true },
    });

    const issueIds = issues.map((i) => i.id);

    if (issueIds.length > 0) {
      await tx.idea.updateMany({
        where: { issueId: { in: issueIds }, deletedAt: null },
        data: { deletedAt: now },
      });
      await tx.category.updateMany({
        where: { issueId: { in: issueIds }, deletedAt: null },
        data: { deletedAt: now },
      });
      await tx.issueMember.updateMany({
        where: { issueId: { in: issueIds }, deletedAt: null },
        data: { deletedAt: now },
      });
      await tx.issueNode.updateMany({
        where: { issueId: { in: issueIds }, deletedAt: null },
        data: { deletedAt: now },
      });
    }

    await tx.issue.updateMany({
      where: { topicId, deletedAt: null },
      data: { deletedAt: now },
    });

    return await tx.topic.update({
      where: { id: topicId },
      data: { deletedAt: now },
      select: { id: true, projectId: true },
    });
  });
}
