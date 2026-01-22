import { prisma } from '@/lib/prisma';
import { LeaveRepository } from '@/lib/repositories/leave.repository';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findFirst: jest.fn(),
    },
    projectMember: {
      updateMany: jest.fn(),
    },
  },
}));

const mockedPrismaProject = prisma.project as jest.Mocked<typeof prisma.project>;
const mockedPrismaProjectMember = prisma.projectMember as jest.Mocked<typeof prisma.projectMember>;

describe('LeaveRepository (탈퇴 레포지토리)', () => {
  const projectId = 'project-1';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjectOwnerId (프로젝트 소유자 ID 조회)', () => {
    it('프로젝트가 존재하면 소유자의 ID(ownerId)를 반환한다', async () => {
      mockedPrismaProject.findFirst.mockResolvedValue({ ownerId: 'owner-1' } as any);

      const result = await LeaveRepository.getProjectOwnerId(projectId);

      expect(mockedPrismaProject.findFirst).toHaveBeenCalledWith({
        where: {
          id: projectId,
          deletedAt: null, // 삭제되지 않은 프로젝트만 조회
        },
        select: {
          ownerId: true,
        },
      });
      expect(result).toEqual({ ownerId: 'owner-1' });
    });
  });

  describe('leaveProject (프로젝트 탈퇴 처리)', () => {
    it('멤버의 삭제일(deletedAt)을 업데이트하고 수정된 행의 개수를 반환한다', async () => {
      mockedPrismaProjectMember.updateMany.mockResolvedValue({ count: 1 } as any);

      const result = await LeaveRepository.leaveProject(projectId, userId);

      expect(mockedPrismaProjectMember.updateMany).toHaveBeenCalledWith({
        where: {
          projectId,
          userId,
          deletedAt: null, // 아직 탈퇴 처리되지 않은 멤버만 대상
        },
        data: {
          deletedAt: expect.any(Date), // 현재 시각으로 업데이트
        },
      });
      expect(result).toBe(1);
    });
  });
});
