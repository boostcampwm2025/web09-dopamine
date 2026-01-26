import { IssueStatus } from '@prisma/client';
import { PATCH } from '@/app/api/issues/[issueId]/status/route';
import { prisma } from '@/lib/prisma';
import { findIssueById, updateIssueStatus } from '@/lib/repositories/issue.repository';
import { createReport, findReportByIssueId } from '@/lib/repositories/report.repository';
import {
  createMockRequest,
  createMockParams,
  expectErrorResponse,
  expectSuccessResponse,
  setupPrismaTransactionMock,
} from '@test/utils/api-test-helpers';

// 레파지토리 모킹
jest.mock('@/lib/repositories/issue.repository');
jest.mock('@/lib/repositories/report.repository');
jest.mock('@/lib/repositories/word-cloud.repository');
jest.mock('@/lib/sse/sse-service');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

// Mock 함수들의 타입을 명시적으로 설정
const mockedFindIssueById = findIssueById as jest.MockedFunction<typeof findIssueById>;
const mockedUpdateIssueStatus = updateIssueStatus as jest.MockedFunction<typeof updateIssueStatus>;
const mockedFindReportByIssueId = findReportByIssueId as jest.MockedFunction<
  typeof findReportByIssueId
>;
const mockedCreateReport = createReport as jest.MockedFunction<typeof createReport>;
const mockedPrismaTransaction = prisma.$transaction as jest.MockedFunction<
  typeof prisma.$transaction
>;

describe('PATCH /api/issues/[issueId]/status', () => {
  const mockIssueId = 'test-issue-id';
  const mockIssue = {
    title: 'Test Issue',
    status: IssueStatus.SELECT,
    topicId: 'test-topic-id',
    projectId: 'test-project-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('유효성 검증', () => {
    it('유효하지 않은 상태값을 받으면 400 에러를 반환한다', async () => {
      const req = createMockRequest({ status: 'INVALID_STATUS' });
      const params = createMockParams({ issueId: mockIssueId });

      const response = await PATCH(req, params);
      await expectErrorResponse(response, 400, 'INVALID_ISSUE_STATUS');
    });

    it('존재하지 않는 이슈 ID를 받으면 404 에러를 반환한다', async () => {
      const req = createMockRequest({ status: IssueStatus.CLOSE });
      const params = createMockParams({ issueId: mockIssueId });

      mockedFindIssueById.mockResolvedValue(null);

      const response = await PATCH(req, params);
      await expectErrorResponse(response, 404, 'ISSUE_NOT_FOUND');
      expect(mockedFindIssueById).toHaveBeenCalledWith(mockIssueId);
    });
  });

  describe('일반 상태 변경', () => {
    it('CLOSE 이외로 상태 변경 시 리포트를 생성하지 않는다', async () => {
      const req = createMockRequest({ status: IssueStatus.VOTE });
      const params = createMockParams({ issueId: mockIssueId });

      mockedFindIssueById.mockResolvedValue(mockIssue);

      setupPrismaTransactionMock(mockedPrismaTransaction, (mockTx) => {
        mockedUpdateIssueStatus.mockResolvedValue({
          id: mockIssueId,
          status: IssueStatus.VOTE,
        });
        return mockTx;
      });

      const response = await PATCH(req, params);
      const data = await expectSuccessResponse(response, 200);

      expect(data.id).toBe(mockIssueId);
      expect(data.status).toBe(IssueStatus.VOTE);
      expect(mockedFindReportByIssueId).not.toHaveBeenCalled();
      expect(mockedCreateReport).not.toHaveBeenCalled();
    });
  });

  describe('CLOSE 상태로 변경', () => {
    it('리포트가 없을 때 새 리포트를 생성한다', async () => {
      const selectedIdeaId = 'idea-123';
      const memo = 'Test memo';
      const req = createMockRequest({
        status: IssueStatus.CLOSE,
        selectedIdeaId,
        memo,
      });
      const params = createMockParams({ issueId: mockIssueId });

      mockedFindIssueById.mockResolvedValue(mockIssue);
      setupPrismaTransactionMock(mockedPrismaTransaction, (mockTx) => {
        mockedUpdateIssueStatus.mockResolvedValue({
          id: mockIssueId,
          status: IssueStatus.CLOSE,
        });
        mockedFindReportByIssueId.mockResolvedValue(null);
        mockedCreateReport.mockResolvedValue({
          id: 'report-123',
          issueId: mockIssueId,
          selectedIdeaId,
          memo,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        });
        return mockTx;
      });

      const response = await PATCH(req, params);
      const data = await expectSuccessResponse(response, 200);

      expect(data.status).toBe(IssueStatus.CLOSE);
      expect(mockedUpdateIssueStatus).toHaveBeenCalledWith(
        mockIssueId,
        IssueStatus.CLOSE,
        expect.any(Object),
      );
      expect(mockedFindReportByIssueId).toHaveBeenCalledWith(mockIssueId, expect.any(Object));
      expect(mockedCreateReport).toHaveBeenCalledWith(
        mockIssueId,
        selectedIdeaId,
        memo,
        expect.any(Object),
      );
    });

    it('이미 리포트가 있을 때 새 리포트를 생성하지 않는다', async () => {
      const req = createMockRequest({ status: IssueStatus.CLOSE });
      const params = createMockParams({ issueId: mockIssueId });

      const existingReport = {
        id: 'existing-report',
        issueId: mockIssueId,
        selectedIdeaId: null,
        memo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockedFindIssueById.mockResolvedValue(mockIssue);
      setupPrismaTransactionMock(mockedPrismaTransaction, (mockTx) => {
        mockedUpdateIssueStatus.mockResolvedValue({
          id: mockIssueId,
          status: IssueStatus.CLOSE,
        });
        mockedFindReportByIssueId.mockResolvedValue(existingReport);
        return mockTx;
      });

      const response = await PATCH(req, params);
      const data = await expectSuccessResponse(response, 200);

      expect(data.status).toBe(IssueStatus.CLOSE);
      expect(mockedFindReportByIssueId).toHaveBeenCalledWith(mockIssueId, expect.any(Object));
      expect(mockedCreateReport).not.toHaveBeenCalled();
    });

    it('리포트 생성 시 selectedIdeaId와 memo가 null일 수 있다', async () => {
      const req = createMockRequest({ status: IssueStatus.CLOSE });
      const params = createMockParams({ issueId: mockIssueId });

      mockedFindIssueById.mockResolvedValue(mockIssue);
      setupPrismaTransactionMock(mockedPrismaTransaction, (mockTx) => {
        mockedUpdateIssueStatus.mockResolvedValue({
          id: mockIssueId,
          status: IssueStatus.CLOSE,
        });
        mockedFindReportByIssueId.mockResolvedValue(null);
        mockedCreateReport.mockResolvedValue({
          id: 'report-123',
          issueId: mockIssueId,
          selectedIdeaId: null,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        });
        return mockTx;
      });

      const response = await PATCH(req, params);
      await expectSuccessResponse(response, 200);

      expect(mockedCreateReport).toHaveBeenCalledWith(mockIssueId, null, null, expect.any(Object));
    });
  });

  describe('트랜잭션', () => {
    it('상태 변경과 리포트 생성이 트랜잭션으로 실행된다', async () => {
      const req = createMockRequest({
        status: IssueStatus.CLOSE,
        selectedIdeaId: 'idea-123',
        memo: 'Test memo',
      });
      const params = createMockParams({ issueId: mockIssueId });

      mockedFindIssueById.mockResolvedValue(mockIssue);
      setupPrismaTransactionMock(mockedPrismaTransaction, (mockTx) => {
        mockedUpdateIssueStatus.mockResolvedValue({
          id: mockIssueId,
          status: IssueStatus.CLOSE,
        });
        mockedFindReportByIssueId.mockResolvedValue(null);
        mockedCreateReport.mockResolvedValue({
          id: 'report-123',
          issueId: mockIssueId,
          selectedIdeaId: 'idea-123',
          memo: 'Test memo',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        });
        return mockTx;
      });

      const response = await PATCH(req, params);

      await expectSuccessResponse(response, 200);
      expect(mockedPrismaTransaction).toHaveBeenCalledTimes(1);
      expect(mockedPrismaTransaction).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('에러 처리', () => {
    it('예상치 못한 에러 발생 시 500 에러를 반환한다', async () => {
      const req = createMockRequest({ status: IssueStatus.CLOSE });
      const params = createMockParams({ issueId: mockIssueId });

      mockedFindIssueById.mockRejectedValue(new Error('Database error'));

      const response = await PATCH(req, params);
      await expectErrorResponse(response, 500, 'ISSUE_STATUS_UPDATE_FAILED');
    });
  });
});
