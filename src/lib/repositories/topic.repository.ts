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
