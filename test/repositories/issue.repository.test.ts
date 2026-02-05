import { IssueRole, IssueStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  createIssue,
  findIssueById,
  findIssueWithPermissionData,
  findIssuesWithMapDataByTopicId,
  softDeleteIssue,
  updateIssueStatus,
  updateIssueTitle,
} from '@/lib/repositories/issue.repository';
import { PrismaTransaction } from '@/types/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    issue: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    idea: { updateMany: jest.fn() },
    category: { updateMany: jest.fn() },
    issueMember: { updateMany: jest.fn() },
    issueNode: { updateMany: jest.fn() },
    issueConnection: { findMany: jest.fn() },
  },
}));

const mockedPrismaIssue = prisma.issue as jest.Mocked<typeof prisma.issue>;
const mockedPrismaIssueConnection = prisma.issueConnection as jest.Mocked<
  typeof prisma.issueConnection
>;

describe('Issue Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createIssue', () => {
    it('트랜잭션을 사용하여 이슈를 생성한다', async () => {
      const mockTx = {
        issue: {
          create: jest.fn().mockResolvedValue({
            id: 'issue-123',
            title: 'Test Issue',
            status: IssueStatus.SELECT,
            topicId: 'topic-123',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            closedAt: null,
          }),
        },
      } as unknown as PrismaTransaction;

      const result = await createIssue(mockTx, 'Test Issue');

      expect(mockTx.issue.create).toHaveBeenCalledWith({
        data: { title: 'Test Issue' },
      });
      expect(result.id).toBe('issue-123');
      expect(result.title).toBe('Test Issue');
    });

    it('topicId가 있으면 이슈 노드가 함께 생성된다', async () => {
      // 역할: 맵 화면에서 필요한 노드가 누락되지 않도록 연관 생성 로직을 검증한다.
      const mockTx = {
        issue: {
          create: jest.fn().mockResolvedValue({
            id: 'issue-123',
            title: 'Test Issue',
            status: IssueStatus.SELECT,
            topicId: 'topic-123',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            closedAt: null,
          }),
        },
        issueNode: {
          findFirst: jest.fn().mockResolvedValue({
            positionX: 720,
            positionY: 300,
          }),
        },
      } as unknown as PrismaTransaction;

      await createIssue(mockTx, 'Test Issue', 'topic-123');

      expect(mockTx.issueNode.findFirst).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          issue: {
            topicId: 'topic-123',
            deletedAt: null,
          },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          positionX: true,
          positionY: true,
        },
      });
      expect(mockTx.issue.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Issue',
          topicId: 'topic-123',
          issueNode: {
            create: {
              positionX: 1000,
              positionY: 300,
            },
          },
        },
      });
    });
  });

  describe('findIssueById', () => {
    it('삭제되지 않은 이슈를 ID로 조회한다', async () => {
      // 준비
      const mockPrismaResult = {
        title: 'Test Issue',
        status: IssueStatus.SELECT,
        topicId: 'topic-123',
        topic: {
          projectId: 'project-123',
        },
      };

      const expectedResult = {
        title: 'Test Issue',
        status: IssueStatus.SELECT,
        topicId: 'topic-123',
        projectId: 'project-123',
      };

      mockedPrismaIssue.findFirst.mockResolvedValue(mockPrismaResult as any);

      // 실행
      const result = await findIssueById('issue-123');

      // 검증: 올바른 조건으로 조회했는지 확인
      expect(mockedPrismaIssue.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'issue-123',
          deletedAt: null, // 삭제되지 않은 이슈만 조회
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
      expect(result).toEqual(expectedResult);
    });

    /**
     * 이슈를 찾지 못한 경우 테스트
     */
    it('존재하지 않는 이슈를 조회하면 null을 반환한다', async () => {
      // 준비: 이슈를 찾지 못함
      mockedPrismaIssue.findFirst.mockResolvedValue(null);

      // 실행
      const result = await findIssueById('non-existent-id');

      // 검증
      expect(result).toBeNull();
    });

    it('토픽 정보가 없으면 projectId는 null로 반환된다', async () => {
      // 역할: 토픽이 없는 이슈도 안전하게 응답하도록 null 분기를 보장한다.
      mockedPrismaIssue.findFirst.mockResolvedValue({
        title: 'Test Issue',
        status: IssueStatus.SELECT,
        topicId: null,
        topic: null,
      } as any);

      const result = await findIssueById('issue-123');

      expect(result).toEqual({
        title: 'Test Issue',
        status: IssueStatus.SELECT,
        topicId: null,
        projectId: null,
      });
    });
  });

  describe('updateIssueStatus', () => {
    const mockIssueId = 'issue-123';

    it('트랜잭션 없이 이슈 상태를 업데이트한다', async () => {
      // 준비
      const updatedIssue = {
        id: mockIssueId,
        status: IssueStatus.VOTE,
      };

      mockedPrismaIssue.update.mockResolvedValue(updatedIssue as any);

      // 실행: 트랜잭션 없이 호출
      const result = await updateIssueStatus(mockIssueId, IssueStatus.VOTE);

      // 검증
      expect(mockedPrismaIssue.update).toHaveBeenCalledWith({
        where: { id: mockIssueId },
        data: {
          status: IssueStatus.VOTE,
          closedAt: null, // CLOSE가 아니므로 null
        },
        select: {
          id: true,
          status: true,
        },
      });
      expect(result.status).toBe(IssueStatus.VOTE);
    });

    it('트랜잭션을 사용하여 이슈 상태를 업데이트한다', async () => {
      // 준비: 가짜 트랜잭션 객체
      const mockTx = {
        issue: {
          update: jest.fn().mockResolvedValue({
            id: mockIssueId,
            status: IssueStatus.VOTE,
          }),
        },
      } as unknown as PrismaTransaction;

      // 실행: 트랜잭션과 함께 호출
      const result = await updateIssueStatus(mockIssueId, IssueStatus.VOTE, mockTx);

      // 검증: 트랜잭션 객체의 update가 호출되었는지 확인
      expect(mockTx.issue.update).toHaveBeenCalledWith({
        where: { id: mockIssueId },
        data: {
          status: IssueStatus.VOTE,
          closedAt: null,
        },
        select: {
          id: true,
          status: true,
        },
      });
      expect(result.status).toBe(IssueStatus.VOTE);
    });

    it('CLOSE 상태로 변경 시 closedAt이 설정된다', async () => {
      // 준비
      const now = new Date();
      const updatedIssue = {
        id: mockIssueId,
        status: IssueStatus.CLOSE,
      };

      mockedPrismaIssue.update.mockResolvedValue(updatedIssue as any);

      // 실행
      await updateIssueStatus(mockIssueId, IssueStatus.CLOSE);

      // 검증: closedAt이 설정되었는지 확인
      const updateCall = mockedPrismaIssue.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe(IssueStatus.CLOSE);
      expect(updateCall.data.closedAt).toBeInstanceOf(Date);

      // closedAt이 현재 시간과 비슷한지 확인
      const closedAt = updateCall.data.closedAt as Date;
      expect(closedAt.getTime()).toBeGreaterThanOrEqual(now.getTime() - 1000);
      expect(closedAt.getTime()).toBeLessThanOrEqual(now.getTime() + 1000);
    });

    it('CLOSE가 아닌 상태로 변경 시 closedAt은 null이다', async () => {
      // 준비
      const updatedIssue = {
        id: mockIssueId,
        status: IssueStatus.SELECT,
      };

      mockedPrismaIssue.update.mockResolvedValue(updatedIssue as any);

      // 실행
      await updateIssueStatus(mockIssueId, IssueStatus.SELECT);

      // 검증: closedAt이 null인지 확인
      const updateCall = mockedPrismaIssue.update.mock.calls[0][0];
      expect(updateCall.data.closedAt).toBeNull();
    });
  });

  describe('findIssuesWithMapDataByTopicId', () => {
    it('이슈/연결 정보를 함께 조회한다', async () => {
      // 역할: 맵 화면 렌더링에 필요한 이슈/연결 데이터를 동시에 제공하는지 확인한다.
      mockedPrismaIssue.findMany.mockResolvedValue([{ id: 'issue-1' }] as any);
      mockedPrismaIssueConnection.findMany.mockResolvedValue([{ id: 'conn-1' }] as any);

      const result = await findIssuesWithMapDataByTopicId('topic-1');

      expect(mockedPrismaIssue.findMany).toHaveBeenCalledWith({
        where: { topicId: 'topic-1', deletedAt: null },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          issueNode: {
            where: { deletedAt: null },
            select: {
              id: true,
              positionX: true,
              positionY: true,
            },
          },
        },
      });
      expect(mockedPrismaIssueConnection.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          sourceIssue: { topicId: 'topic-1', deletedAt: null },
          targetIssue: { topicId: 'topic-1', deletedAt: null },
        },
        select: {
          id: true,
          sourceIssueId: true,
          targetIssueId: true,
          sourceHandle: true,
          targetHandle: true,
        },
      });
      expect(result).toEqual({ issues: [{ id: 'issue-1' }], connections: [{ id: 'conn-1' }] });
    });
  });
  describe('findIssueWithPermissionData', () => {
    const mockIssueId = 'issue-123';
    const mockUserId = 'user-456';

    it('이슈 ID와 유저 ID로 권한 관련 데이터를 조회한다', async () => {
      // Given
      const mockQueryResult = {
        topicId: 'topic-1',
        issueMembers: [{ id: 'mem-1' }], // Owner 여부
        topic: {
          project: {
            projectMembers: [{ id: 'pm-1' }], // 프로젝트 멤버 여부
          },
        },
      };

      (prisma.issue.findUnique as jest.Mock).mockResolvedValue(mockQueryResult);

      // When
      const result = await findIssueWithPermissionData(mockIssueId, mockUserId);

      // Then
      expect(prisma.issue.findUnique).toHaveBeenCalledWith({
        where: { id: mockIssueId, deletedAt: null },
        select: {
          topicId: true,
          issueMembers: {
            where: { userId: mockUserId, role: IssueRole.OWNER },
            select: { id: true },
          },
          topic: {
            select: {
              project: {
                select: {
                  projectMembers: {
                    where: { userId: mockUserId },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockQueryResult);
    });

    it('이슈가 없거나 삭제된 경우 null을 반환한다', async () => {
      (prisma.issue.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await findIssueWithPermissionData('invalid-id', 'user-1');

      expect(result).toBeNull();
    });
  });
  describe('updateIssueTitle', () => {
    const mockIssueId = 'issue-123';
    const newTitle = '변경된 제목';

    it('이슈의 제목을 성공적으로 수정한다', async () => {
      // Given
      const mockUpdatedResult = {
        id: mockIssueId,
        title: newTitle,
        topicId: 'topic-789',
      };
      mockedPrismaIssue.update.mockResolvedValue(mockUpdatedResult as any);

      // When
      const result = await updateIssueTitle(mockIssueId, newTitle);

      // Then
      expect(mockedPrismaIssue.update).toHaveBeenCalledWith({
        where: { id: mockIssueId },
        data: { title: newTitle },
        select: { id: true, title: true, topicId: true },
      });
      expect(result).toEqual(mockUpdatedResult);
    });
  });

  describe('softDeleteIssue', () => {
    const mockIssueId = 'issue-123';

    it('트랜잭션을 사용하여 이슈와 관련된 모든 데이터(Idea, Category, Member, Node)를 soft delete한다', async () => {
      const mockTx = {
        idea: { updateMany: jest.fn().mockResolvedValue({ count: 2 }) },
        category: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
        issueMember: { updateMany: jest.fn().mockResolvedValue({ count: 3 }) },
        issueNode: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
        issue: {
          update: jest.fn().mockResolvedValue({ id: mockIssueId, topicId: 'topic-1' }),
        },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      const result = await softDeleteIssue(mockIssueId);

      const expectedUpdateMany = {
        where: { issueId: mockIssueId, deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      };

      expect(mockTx.idea.updateMany).toHaveBeenCalledWith(expectedUpdateMany);
      expect(mockTx.category.updateMany).toHaveBeenCalledWith(expectedUpdateMany);
      expect(mockTx.issueMember.updateMany).toHaveBeenCalledWith(expectedUpdateMany);
      expect(mockTx.issueNode.updateMany).toHaveBeenCalledWith(expectedUpdateMany);

      expect(mockTx.issue.update).toHaveBeenCalledWith({
        where: { id: mockIssueId },
        data: { deletedAt: expect.any(Date) },
        select: { id: true, topicId: true },
      });

      expect(result.id).toBe(mockIssueId);
    });

    it('트랜잭션 도중 에러가 발생하면 상위로 에러를 던져야 한다', async () => {
      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Transaction Failed'));

      await expect(softDeleteIssue(mockIssueId)).rejects.toThrow('Transaction Failed');
    });
  });
});
