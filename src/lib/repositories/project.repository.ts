import { prisma } from '@/lib/prisma';

export const getProjectsByOwnerId = async (ownerId: string) => {
  const projects = await prisma.project.findMany({
    where: {
      ownerId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          projectMembers: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    memberCount: project._count.projectMembers,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }));
};

export const createProject = async (title: string, ownerId: string, description?: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. 프로젝트 생성
    const project = await tx.project.create({
      data: {
        title,
        description,
        ownerId,
      },
    });

    // 2. owner를 프로젝트 멤버로 추가
    await tx.projectMember.create({
      data: {
        projectId: project.id,
        userId: ownerId,
      },
    });

    return {
      id: project.id,
      title: project.title,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
    };
  });
};

export const deleteProject = async (id: string, ownerId: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. 프로젝트 삭제
    const project = await tx.project.update({
      where: {
        id,
        ownerId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    // 2. 프로젝트 멤버 삭제
    await tx.projectMember.updateMany({
      where: {
        projectId: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      id: project.id,
      title: project.title,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
    };
  });
};