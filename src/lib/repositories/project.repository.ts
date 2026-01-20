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

export const getProjectWithTopics = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      description: true,
      ownerId: true,
      createdAt: true,
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      projectMembers: {
        where: {
          deletedAt: null,
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      topics: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              issues: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  // 멤버 리스트 생성 (중복 제거)
  const memberMap = new Map();

  // 프로젝트 멤버들 추가
  project.projectMembers.forEach((pm) => {
    if (pm.user) {
      memberMap.set(pm.user.id, {
        id: pm.user.id,
        name: pm.user.name,
        image: pm.user.image,
        role: pm.user.id === project.ownerId ? 'OWNER' : 'MEMBER',
      });
    }
  });

  const members = Array.from(memberMap.values());

  return {
    id: project.id,
    owner_id: project.ownerId,
    title: project.title,
    description: project.description,
    created_at: project.createdAt,
    topics: project.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      issueCount: topic._count.issues,
    })),
    members,
  };
};

export const createProject = async (title: string, ownerId: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. 프로젝트 생성
    const project = await tx.project.create({
      data: {
        title,
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
