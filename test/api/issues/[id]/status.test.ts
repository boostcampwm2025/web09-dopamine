import { NextRequest } from 'next/server';
import { IssueStatus } from '@prisma/client';
import { PATCH } from '@/app/api/issues/[id]/status/route';
import { prisma } from '@/lib/prisma';
import { findIssueById, updateIssueStatus } from '@/lib/repositories/issue.repository';
import { createReport, findReportByIssueId } from '@/lib/repositories/report.repository';

// 레파지토리 모킹
jest.mock('@/lib/repositories/issue.repository');
jest.mock('@/lib/repositories/report.repository');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(), // 트랜잭션도 mock으로 대체
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

describe('PATCH /api/issues/[id]/status', () => {
  const mockIssueId = 'test-issue-id';
  const mockIssue = {
    id: mockIssueId,
    title: 'Test Issue',
    status: IssueStatus.SELECT,
    topicId: 'test-topic-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    closedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (body: any) => {
    return {
      json: jest.fn().mockResolvedValue(body), // req.json() 호출 시 body를 반환하도록 설정
    } as unknown as NextRequest;
  };

  const createMockParams = (id: string) => {
    return {
      params: Promise.resolve({ id }),
    };
  };

  describe('유효성 검증', () => {
    it('유효하지 않은 상태값을 받으면 400 에러를 반환한다', async () => {
      const req = createMockRequest({ status: 'INVALID_STATUS' });
      const params = createMockParams(mockIssueId);

      const response = await PATCH(req, params);
      const data = await response.json();

      expect(response.status).toBe(400); // HTTP 상태 코드가 400인지 확인
      expect(data.message).toBe('유효하지 않은 이슈 상태입니다.'); // 에러 메시지 확인
    });

    it('존재하지 않는 이슈 ID를 받으면 404 에러를 반환한다', async () => {
      const req = createMockRequest({ status: IssueStatus.CLOSE });
      const context = createMockParams(mockIssueId);

      // Mock 설정: findIssueById가 null을 반환하도록 설정 (이슈를 찾지 못한 상황)
      mockedFindIssueById.mockResolvedValue(null);

      // 2. 실행: API 호출
      const response = await PATCH(req, context);
      const data = await response.json();

      // 3. 검증: 결과 확인
      expect(response.status).toBe(404); // 404 에러 반환 확인
      expect(data.message).toBe('존재하지 않는 이슈입니다.'); // 에러 메시지 확인
      expect(mockedFindIssueById).toHaveBeenCalledWith(mockIssueId); // findIssueById가 올바른 인자로 호출되었는지 확인
    });
  });

  describe('일반 상태 변경', () => {
    it('CLOSE 이외로 상태 변경 시 리포트를 생성하지 않는다', async () => {
      const req = createMockRequest({ status: IssueStatus.VOTE });
      const context = createMockParams(mockIssueId);

      mockedFindIssueById.mockResolvedValue(mockIssue);

      // Mock 설정: 트랜잭션이 실행되도록 구현
      mockedPrismaTransaction.mockImplementation(async (callback: any) => {
        const mockTx = {}; // 가짜 트랜잭션 객체

        // updateIssueStatus가 성공적으로 실행되었다고 가정
        mockedUpdateIssueStatus.mockResolvedValue({
          id: mockIssueId,
          status: IssueStatus.CLOSE,
        });

        // 트랜잭션 콜백 함수 실행
        return callback(mockTx);
      });

      const response = await PATCH(req, context);
      const data = await response.json();

      expect(response.status).toBe(200); // 성공 응답
      expect(data.id).toBe(mockIssueId); // 이슈 ID 확인
      expect(data.status).toBe(IssueStatus.CLOSE); // 상태 변경 확인

      // 리포트 관련 함수들이 호출되지 않았는지 확인
      expect(mockedFindReportByIssueId).not.toHaveBeenCalled(); // 리포트 조회 안 함
      expect(mockedCreateReport).not.toHaveBeenCalled(); // 리포트 생성 안 함
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
      const context = createMockParams(mockIssueId);

      mockedFindIssueById.mockResolvedValue(mockIssue);
      mockedPrismaTransaction.mockImplementation(async (callback: any) => {
        const mockTx = {};
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
        return callback(mockTx);
      });

      const response = await PATCH(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
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
      const context = createMockParams(mockIssueId);

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
      mockedPrismaTransaction.mockImplementation(async (callback: any) => {
        const mockTx = {};
        mockedUpdateIssueStatus.mockResolvedValue({
          id: mockIssueId,
          status: IssueStatus.CLOSE,
        });
        mockedFindReportByIssueId.mockResolvedValue(existingReport);
        return callback(mockTx);
      });

      const response = await PATCH(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe(IssueStatus.CLOSE);
      expect(mockedFindReportByIssueId).toHaveBeenCalledWith(mockIssueId, expect.any(Object));
      expect(mockedCreateReport).not.toHaveBeenCalled();
    });

    it('리포트 생성 시 selectedIdeaId와 memo가 null일 수 있다', async () => {
      const req = createMockRequest({ status: IssueStatus.CLOSE });
      const context = createMockParams(mockIssueId);

      mockedFindIssueById.mockResolvedValue(mockIssue);
      mockedPrismaTransaction.mockImplementation(async (callback: any) => {
        const mockTx = {};
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
        return callback(mockTx);
      });

      const response = await PATCH(req, context);

      expect(response.status).toBe(200);
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
      const context = createMockParams(mockIssueId);

      mockedFindIssueById.mockResolvedValue(mockIssue);
      mockedPrismaTransaction.mockImplementation(async (callback: any) => {
        const mockTx = {};
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
        return callback(mockTx);
      });

      const response = await PATCH(req, context);

      expect(response.status).toBe(200);
      expect(mockedPrismaTransaction).toHaveBeenCalledTimes(1);
      expect(mockedPrismaTransaction).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('에러 처리', () => {
    it('예상치 못한 에러 발생 시 500 에러를 반환한다', async () => {
      const req = createMockRequest({ status: IssueStatus.CLOSE });
      const context = createMockParams(mockIssueId);

      mockedFindIssueById.mockRejectedValue(new Error('Database error'));

      const response = await PATCH(req, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('이슈 상태 변경에 실패했습니다.');
    });
  });
});
