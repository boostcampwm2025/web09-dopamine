import { prisma } from '@/lib/prisma';
import { PrismaTransaction } from '@/types/prisma';

type PrismaClientOrTx = PrismaTransaction | typeof prisma;

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
      ownerId: true,
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
    ownerId: project.ownerId,
    memberCount: project._count.projectMembers,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }));
};

// 참여중인 프로젝트 조회
export const getProjectsByMemberId = async (userId: string) => {
  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,
      ownerId: {
        not: userId,
      },
      projectMembers: {
        some: {
          userId,
          deletedAt: null,
        },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      ownerId: true,
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
    ownerId: project.ownerId,
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
          createdAt: 'desc',
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

  // 멤버 정렬: OWNER가 먼저, 그 다음 MEMBER
  const members = Array.from(memberMap.values()).sort((a, b) => {
    if (a.role === 'OWNER' && b.role === 'MEMBER') return -1;
    if (a.role === 'MEMBER' && b.role === 'OWNER') return 1;
    return 0;
  });

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

export const updateProject = async (
  id: string,
  title: string,
  description?: string,
  tx?: PrismaTransaction,
) => {
  // 트랜잭션이 제공되면 그것을 사용하고, 그렇지 않으면 기본 prisma 클라이언트를 사용합니다.
  const client: PrismaClientOrTx = tx ?? prisma;

  return client.project.update({
    where: {
      id,
    },
    data: {
      title,
      description,
    },
  });
};
