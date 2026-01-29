import { prisma } from '@/lib/prisma';
import {
  createReport,
  findReportByIssueId,
  findReportWithDetailsById,
} from '@/lib/repositories/report.repository';
import { PrismaTransaction } from '@/types/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    report: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockedPrismaReport = prisma.report as jest.Mocked<typeof prisma.report>;

describe('Report Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findReportByIssueId', () => {
    const mockIssueId = 'issue-123';

    it('트랜잭션 없이 이슈 ID로 리포트를 조회한다', async () => {
      // 준비
      const mockReport = {
        id: 'report-123',
        issueId: mockIssueId,
        selectedIdeaId: 'idea-123',
        memo: 'Test memo',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockedPrismaReport.findFirst.mockResolvedValue(mockReport);

      // 실행: 트랜잭션 없이 호출
      const result = await findReportByIssueId(mockIssueId);

      // 검증
      expect(mockedPrismaReport.findFirst).toHaveBeenCalledWith({
        where: {
          issueId: mockIssueId,
          deletedAt: null, // 삭제되지 않은 리포트만 조회
        },
      });
      expect(result).toEqual(mockReport);
    });

    /**
     * 트랜잭션을 사용하여 리포트를 조회하는 테스트
     */
    it('트랜잭션을 사용하여 이슈 ID로 리포트를 조회한다', async () => {
      // 준비: 가짜 트랜잭션 객체
      const mockReport = {
        id: 'report-123',
        issueId: mockIssueId,
        selectedIdeaId: null,
        memo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockTx = {
        report: {
          findFirst: jest.fn().mockResolvedValue(mockReport),
        },
      } as unknown as PrismaTransaction;

      // 실행: 트랜잭션과 함께 호출
      const result = await findReportByIssueId(mockIssueId, mockTx);

      // 검증: 트랜잭션 객체의 findFirst가 호출되었는지 확인
      expect(mockTx.report.findFirst).toHaveBeenCalledWith({
        where: {
          issueId: mockIssueId,
          deletedAt: null,
        },
      });
      expect(result).toEqual(mockReport);
    });

    /**
     * 리포트를 찾지 못한 경우 테스트
     */
    it('존재하지 않는 리포트를 조회하면 null을 반환한다', async () => {
      // 준비: 리포트를 찾지 못함
      mockedPrismaReport.findFirst.mockResolvedValue(null);

      // 실행
      const result = await findReportByIssueId('non-existent-issue-id');

      // 검증
      expect(result).toBeNull();
    });
  });

  describe('createReport', () => {
    const mockIssueId = 'issue-123';

    it('트랜잭션 없이 리포트를 생성한다', async () => {
      // 준비
      const selectedIdeaId = 'idea-123';
      const memo = 'Test memo';
      const mockReport = {
        id: 'report-123',
        issueId: mockIssueId,
        selectedIdeaId,
        memo,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockedPrismaReport.create.mockResolvedValue(mockReport);

      // 실행: 트랜잭션 없이 호출
      const result = await createReport(mockIssueId, selectedIdeaId, memo);

      // 검증
      expect(mockedPrismaReport.create).toHaveBeenCalledWith({
        data: {
          issueId: mockIssueId,
          selectedIdeaId,
          memo,
        },
      });
      expect(result).toEqual(mockReport);
    });

    /**
     * 트랜잭션을 사용하여 리포트를 생성하는 테스트
     */
    it('트랜잭션을 사용하여 리포트를 생성한다', async () => {
      // 준비: 가짜 트랜잭션 객체
      const selectedIdeaId = 'idea-123';
      const memo = 'Test memo';
      const mockReport = {
        id: 'report-123',
        issueId: mockIssueId,
        selectedIdeaId,
        memo,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockTx = {
        report: {
          create: jest.fn().mockResolvedValue(mockReport),
        },
      } as unknown as PrismaTransaction;

      // 실행: 트랜잭션과 함께 호출
      const result = await createReport(mockIssueId, selectedIdeaId, memo, mockTx);

      // 검증: 트랜잭션 객체의 create가 호출되었는지 확인
      expect(mockTx.report.create).toHaveBeenCalledWith({
        data: {
          issueId: mockIssueId,
          selectedIdeaId,
          memo,
        },
      });
      expect(result).toEqual(mockReport);
    });

    /**
     * selectedIdeaId와 memo가 null인 리포트를 생성하는 테스트
     *
     * 중요: 이슈를 닫을 때 아이디어 선택과 메모는 선택사항
     */
    it('selectedIdeaId와 memo가 null인 리포트를 생성한다', async () => {
      // 준비
      const mockReport = {
        id: 'report-123',
        issueId: mockIssueId,
        selectedIdeaId: null,
        memo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockedPrismaReport.create.mockResolvedValue(mockReport);

      // 실행: selectedIdeaId와 memo를 null로 전달
      const result = await createReport(mockIssueId, null, null);

      // 검증
      expect(mockedPrismaReport.create).toHaveBeenCalledWith({
        data: {
          issueId: mockIssueId,
          selectedIdeaId: null,
          memo: null,
        },
      });
      expect(result.selectedIdeaId).toBeNull();
      expect(result.memo).toBeNull();
    });

    /**
     * selectedIdeaId만 있고 memo는 null인 경우
     */
    it('selectedIdeaId만 있고 memo가 null인 리포트를 생성한다', async () => {
      // 준비
      const selectedIdeaId = 'idea-123';
      const mockReport = {
        id: 'report-123',
        issueId: mockIssueId,
        selectedIdeaId,
        memo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockedPrismaReport.create.mockResolvedValue(mockReport);

      // 실행
      const result = await createReport(mockIssueId, selectedIdeaId, null);

      // 검증
      expect(mockedPrismaReport.create).toHaveBeenCalledWith({
        data: {
          issueId: mockIssueId,
          selectedIdeaId,
          memo: null,
        },
      });
      expect(result.selectedIdeaId).toBe(selectedIdeaId);
      expect(result.memo).toBeNull();
    });
  });

  describe('findReportWithDetailsById', () => {
    const mockIssueId = 'issue-123';

    it('리포트 상세 조회 시 필요한 모든 연관 데이터를 포함한다', async () => {
      // 역할: 리포트 상세 화면에 필요한 조인 데이터가 누락되지 않도록 include 구성을 보장한다.
      const mockReport = { id: 'report-1' } as any;
      mockedPrismaReport.findFirst.mockResolvedValue(mockReport);

      const result = await findReportWithDetailsById(mockIssueId);

      expect(mockedPrismaReport.findFirst).toHaveBeenCalledWith({
        where: {
          issueId: mockIssueId,
          deletedAt: null,
        },
        include: {
          issue: {
            select: {
              id: true,
              title: true,
              issueMembers: {
                where: { deletedAt: null },
                select: {
                  id: true,
                  userId: true,
                  nickname: true,
                  deletedAt: true,
                },
              },
              ideas: {
                where: { deletedAt: null },
                select: {
                  id: true,
                  content: true,
                  agreeCount: true,
                  disagreeCount: true,
                  comments: {
                    where: { deletedAt: null },
                    select: { id: true, content: true },
                  },
                  category: {
                    select: {
                      id: true,
                      title: true,
                    },
                  },
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
          selectedIdea: {
            select: {
              id: true,
              content: true,
              agreeCount: true,
              disagreeCount: true,
              comments: {
                where: { deletedAt: null },
                select: { id: true },
              },
              category: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockReport);
    });

    it('트랜잭션이 전달되면 해당 클라이언트로 상세 조회한다', async () => {
      // 역할: 상위 트랜잭션 컨텍스트에서 일관된 읽기를 보장한다.
      const mockReport = { id: 'report-1' } as any;
      const mockTx = {
        report: {
          findFirst: jest.fn().mockResolvedValue(mockReport),
        },
      } as unknown as PrismaTransaction;

      const result = await findReportWithDetailsById(mockIssueId, mockTx);

      expect(mockTx.report.findFirst).toHaveBeenCalled();
      expect(result).toEqual(mockReport);
    });
  });
});
