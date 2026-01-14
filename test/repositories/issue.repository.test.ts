import { IssueStatus, Issue } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createIssue, findIssueById, updateIssueStatus } from '@/lib/repositories/issue.repository';
import { PrismaTransaction } from '@/types/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    issue: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockedPrismaIssue = prisma.issue as jest.Mocked<typeof prisma.issue>;

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
  });

  describe('findIssueById', () => {
    it('삭제되지 않은 이슈를 ID로 조회한다', async () => {
      // 준비
      const mockIssue = {
        id: 'issue-123',
        title: 'Test Issue',
        status: IssueStatus.SELECT,
        topicId: 'topic-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        closedAt: null,
      } as Issue;

      mockedPrismaIssue.findFirst.mockResolvedValue(mockIssue as Issue);

      // 실행
      const result = await findIssueById('issue-123');

      // 검증: 올바른 조건으로 조회했는지 확인
      expect(mockedPrismaIssue.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'issue-123',
          deletedAt: null, // 삭제되지 않은 이슈만 조회
        },
      });
      expect(result).toEqual(mockIssue);
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
});
