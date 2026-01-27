import { prisma } from '@/lib/prisma';
import {
  createProject,
  deleteProject,
  getProjectWithTopics,
  getProjectsByMemberId,
  getProjectsByOwnerId,
  updateProject,
} from '@/lib/repositories/project.repository';
import { PrismaTransaction } from '@/types/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    projectMember: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockedProject = prisma.project as jest.Mocked<typeof prisma.project>;
const mockedProjectMember = prisma.projectMember as jest.Mocked<typeof prisma.projectMember>;
const mockedTransaction = prisma.$transaction as jest.Mock;

describe('Project Repository 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('소유자 ID로 프로젝트 목록을 조회하고 멤버 수를 매핑한다', async () => {
    // 역할: 프로젝트 리스트에 멤버 수가 정확히 표시되도록 매핑 로직을 보장한다.
    const ownerId = 'owner-1';
    const now = new Date();

    mockedProject.findMany.mockResolvedValue([
      {
        id: 'project-1',
        title: '프로젝트1',
        description: '설명',
        ownerId,
        createdAt: now,
        updatedAt: now,
        _count: { projectMembers: 2 },
      },
    ] as any);

    const result = await getProjectsByOwnerId(ownerId);

    expect(mockedProject.findMany).toHaveBeenCalledWith({
      where: { ownerId, deletedAt: null },
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
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual([
      {
        id: 'project-1',
        title: '프로젝트1',
        description: '설명',
        ownerId,
        memberCount: 2,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  });

  it('멤버로 참여한 프로젝트 목록을 조회한다', async () => {
    // 역할: 본인이 소유하지 않은 참여 프로젝트만 필터링되는지 확인한다.
    const userId = 'user-1';
    const now = new Date();

    mockedProject.findMany.mockResolvedValue([
      {
        id: 'project-2',
        title: '프로젝트2',
        description: '설명',
        ownerId: 'owner-2',
        createdAt: now,
        updatedAt: now,
        _count: { projectMembers: 3 },
      },
    ] as any);

    const result = await getProjectsByMemberId(userId);

    expect(mockedProject.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        ownerId: { not: userId },
        projectMembers: {
          some: { userId, deletedAt: null },
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
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(result[0].memberCount).toBe(3);
  });

  it('프로젝트가 없으면 null을 반환한다', async () => {
    // 역할: 조회 실패 시 null 반환이 컨트롤러 로직에서 정상 분기되도록 보장한다.
    mockedProject.findUnique.mockResolvedValue(null);

    const result = await getProjectWithTopics('project-1');

    expect(result).toBeNull();
  });

  it('프로젝트 상세 조회 시 멤버 중복을 제거하고 OWNER를 먼저 정렬한다', async () => {
    // 역할: 멤버 리스트의 중복/정렬 오류가 UI 표시를 깨뜨리지 않도록 검증한다.
    const now = new Date();

    mockedProject.findUnique.mockResolvedValue({
      id: 'project-1',
      title: '프로젝트1',
      description: '설명',
      ownerId: 'owner-1',
      createdAt: now,
      owner: { id: 'owner-1', name: '오너', displayName: '오너', image: 'owner.png' },
      projectMembers: [
        { user: { id: 'member-1', displayName: '멤버', image: 'member.png' } },
        { user: { id: 'owner-1', displayName: '오너', image: 'owner.png' } },
        { user: { id: 'member-1', displayName: '멤버', image: 'member.png' } },
      ],
      topics: [
        {
          id: 'topic-1',
          title: '토픽',
          _count: { issues: 2 },
        },
      ],
    } as any);

    const result = await getProjectWithTopics('project-1');

    expect(result).toEqual({
      id: 'project-1',
      owner_id: 'owner-1',
      title: '프로젝트1',
      description: '설명',
      created_at: now,
      topics: [{ id: 'topic-1', title: '토픽', issueCount: 2 }],
      members: [
        { id: 'owner-1', name: '오너', image: 'owner.png', role: 'OWNER' },
        { id: 'member-1', name: '멤버', image: 'member.png', role: 'MEMBER' },
      ],
    });
  });

  it('멤버 정렬에서 MEMBER vs OWNER 비교 분기를 통과한다', async () => {
    // 역할: 정렬 비교 로직의 반대 방향 분기를 검증해 순서 뒤바뀜을 방지한다.
    const now = new Date();

    mockedProject.findUnique.mockResolvedValue({
      id: 'project-1',
      title: '프로젝트1',
      description: '설명',
      ownerId: 'owner-1',
      createdAt: now,
      owner: { id: 'owner-1', name: '오너', image: 'owner.png' },
      projectMembers: [
        { user: { id: 'owner-1', displayName: '오너', image: 'owner.png' } },
        { user: { id: 'member-1', displayName: '멤버', image: 'member.png' } },
      ],
      topics: [],
    } as any);

    const result = await getProjectWithTopics('project-1');

    expect(result?.members).toEqual([
      { id: 'owner-1', name: '오너', image: 'owner.png', role: 'OWNER' },
      { id: 'member-1', name: '멤버', image: 'member.png', role: 'MEMBER' },
    ]);
  });

  it('멤버 역할이 동일하면 정렬 비교가 0을 반환한다', async () => {
    // 역할: 동일 역할 간 비교 분기를 통과해 예외적인 정렬 오류를 방지한다.
    const now = new Date();

    mockedProject.findUnique.mockResolvedValue({
      id: 'project-1',
      title: '프로젝트1',
      description: '설명',
      ownerId: 'owner-1',
      createdAt: now,
      owner: { id: 'owner-1', name: '오너', image: 'owner.png' },
      projectMembers: [
        { user: { id: 'member-1', displayName: '멤버1', image: 'member1.png' } },
        { user: { id: 'member-2', displayName: '멤버2', image: 'member2.png' } },
      ],
      topics: [],
    } as any);

    const result = await getProjectWithTopics('project-1');

    expect(result?.members).toEqual([
      { id: 'member-1', name: '멤버1', image: 'member1.png', role: 'MEMBER' },
      { id: 'member-2', name: '멤버2', image: 'member2.png', role: 'MEMBER' },
    ]);
  });

  it('프로젝트 생성 시 프로젝트와 멤버를 트랜잭션으로 함께 생성한다', async () => {
    // 역할: 프로젝트/멤버가 함께 생성돼야 데이터 불일치가 발생하지 않는다.
    const now = new Date();
    const mockTx = {
      project: {
        create: jest.fn().mockResolvedValue({
          id: 'project-1',
          title: '프로젝트1',
          ownerId: 'owner-1',
          createdAt: now,
        }),
      },
      projectMember: {
        create: jest.fn().mockResolvedValue({ id: 'pm-1' }),
      },
    } as unknown as PrismaTransaction;

    mockedTransaction.mockImplementation(async (callback: (tx: PrismaTransaction) => any) =>
      callback(mockTx),
    );

    const result = await createProject('프로젝트1', 'owner-1', '설명');

    expect(mockedTransaction).toHaveBeenCalled();
    expect(mockTx.project.create).toHaveBeenCalledWith({
      data: { title: '프로젝트1', description: '설명', ownerId: 'owner-1' },
    });
    expect(mockTx.projectMember.create).toHaveBeenCalledWith({
      data: { projectId: 'project-1', userId: 'owner-1' },
    });
    expect(result).toEqual({
      id: 'project-1',
      title: '프로젝트1',
      ownerId: 'owner-1',
      createdAt: now,
    });
  });

  it('프로젝트 삭제 시 프로젝트와 멤버를 함께 Soft Delete 한다', async () => {
    // 역할: 멤버 데이터까지 함께 삭제되어 접근 권한이 남지 않도록 보장한다.
    const now = new Date();
    const mockTx = {
      project: {
        update: jest.fn().mockResolvedValue({
          id: 'project-1',
          title: '프로젝트1',
          ownerId: 'owner-1',
          createdAt: now,
        }),
      },
      projectMember: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    } as unknown as PrismaTransaction;

    mockedTransaction.mockImplementation(async (callback: (tx: PrismaTransaction) => any) =>
      callback(mockTx),
    );

    const result = await deleteProject('project-1', 'owner-1');

    expect(mockTx.project.update).toHaveBeenCalledWith({
      where: { id: 'project-1', ownerId: 'owner-1' },
      data: { deletedAt: expect.any(Date) },
    });
    expect(mockTx.projectMember.updateMany).toHaveBeenCalledWith({
      where: { projectId: 'project-1' },
      data: { deletedAt: expect.any(Date) },
    });
    expect(result).toEqual({
      id: 'project-1',
      title: '프로젝트1',
      ownerId: 'owner-1',
      createdAt: now,
    });
  });

  it('트랜잭션이 전달되면 해당 클라이언트로 업데이트한다', async () => {
    // 역할: 상위 트랜잭션 컨텍스트를 존중해 원자적 업데이트가 보장되도록 한다.
    const mockTx = {
      project: {
        update: jest.fn().mockResolvedValue({ id: 'project-1' }),
      },
    } as unknown as PrismaTransaction;

    await updateProject('project-1', '변경', '설명', mockTx);

    expect(mockTx.project.update).toHaveBeenCalledWith({
      where: { id: 'project-1' },
      data: { title: '변경', description: '설명' },
    });
  });

  it('트랜잭션이 없으면 기본 prisma로 업데이트한다', async () => {
    // 역할: 단일 요청에서도 업데이트가 정상 수행되는 기본 경로를 확인한다.
    mockedProject.update.mockResolvedValue({ id: 'project-1' } as any);

    await updateProject('project-1', '변경', undefined);

    expect(mockedProject.update).toHaveBeenCalledWith({
      where: { id: 'project-1' },
      data: { title: '변경', description: undefined },
    });
  });
});
