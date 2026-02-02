import { Prisma } from '@prisma/client';
import {
  createMockGetRequest,
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';
import {
  DELETE,
  PATCH,
} from '@/app/api/issues/[issueId]/ideas/[ideaId]/comments/[commentId]/route';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { commentRepository } from '@/lib/repositories/comment.repository';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { broadcast } from '@/lib/sse/sse-service';

// 1. 모든 의존성 모킹
jest.mock('@/lib/repositories/comment.repository');
jest.mock('@/lib/repositories/idea.repository');
jest.mock('@/lib/sse/sse-service');

// Mock 함수 타입 캐스팅
const mockedUpdate = commentRepository.update as jest.MockedFunction<
  typeof commentRepository.update
>;
const mockedSoftDelete = commentRepository.softDelete as jest.MockedFunction<
  typeof commentRepository.softDelete
>;
const mockedFindByIssueId = ideaRepository.findByIssueId as jest.MockedFunction<
  typeof ideaRepository.findByIssueId
>;
const mockedBroadcast = broadcast as jest.Mock;

describe('PATCH /api/issues/[issueId]/ideas/[ideaId]/comments/[commentId]', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';
  const commentId = 'comment-1';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('content가 없으면 400 에러를 반환한다', async () => {
    const req = createMockRequest({});
    const params = createMockParams({ issueId, ideaId, commentId });

    const response = await PATCH(req, params);
    await expectErrorResponse(response, 400, 'CONTENT_REQUIRED');
  });

  it('성공적으로 댓글을 수정하고 SSE 알림을 보낸다', async () => {
    const mockComment = {
      id: commentId,
      content: 'Updated Comment',
      createdAt: new Date(),
    };

    mockedUpdate.mockResolvedValue(mockComment as any);

    const req = createMockRequest({ content: 'Updated Comment' });
    const params = createMockParams({ issueId, ideaId, commentId });

    const response = await PATCH(req, params);
    const data = await expectSuccessResponse(response, 200);

    // 데이터 검증
    expect(data.id).toBe(commentId);
    expect(data.content).toBe('Updated Comment');
    expect(mockedUpdate).toHaveBeenCalledWith(commentId, 'Updated Comment');

    // SSE Broadcast 검증 추가
    expect(mockedBroadcast).toHaveBeenCalledWith({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.COMMENT_UPDATED,
        data: {
          ideaId,
          commentId,
        },
      },
    });
  });

  it('존재하지 않는 댓글(P2025)을 수정하면 404 에러를 반환한다', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: 'test',
    });
    mockedUpdate.mockRejectedValue(error);

    const req = createMockRequest({ content: 'Updated Comment' });
    const params = createMockParams({ issueId, ideaId, commentId });

    const response = await PATCH(req, params);
    await expectErrorResponse(response, 404, 'COMMENT_NOT_FOUND');
  });

  // 500 에러 케이스 추가
  it('수정 중 알 수 없는 에러가 발생하면 500 에러를 반환한다', async () => {
    mockedUpdate.mockRejectedValue(new Error('DB Error'));

    const req = createMockRequest({ content: 'Updated Comment' });
    const params = createMockParams({ issueId, ideaId, commentId });

    const response = await PATCH(req, params);
    await expectErrorResponse(response, 500, 'COMMENT_UPDATE_FAILED');
  });
});

describe('DELETE /api/issues/[issueId]/ideas/[ideaId]/comments/[commentId]', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';
  const commentId = 'comment-1';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('성공적으로 댓글을 삭제하고 갱신된 댓글 수와 함께 SSE 알림을 보낸다', async () => {
    // 1. Soft Delete 모킹
    mockedSoftDelete.mockResolvedValue({
      id: commentId,
      deletedAt: new Date(),
    } as any);

    // 2. 아이디어 목록 조회 모킹 (댓글 수 계산용)
    mockedFindByIssueId.mockResolvedValue([
      { id: ideaId, commentCount: 5 } as any, // 현재 댓글 수 5개 가정
    ]);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId, commentId });

    const response = await DELETE(req, params);
    await expectSuccessResponse(response, 200);

    expect(mockedSoftDelete).toHaveBeenCalledWith(commentId);

    // SSE Broadcast 검증 추가
    expect(mockedBroadcast).toHaveBeenCalledWith({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.COMMENT_DELETED,
        data: {
          ideaId,
          commentId,
          commentCount: 5, // 모킹한 값과 일치해야 함
        },
      },
    });
  });

  it('존재하지 않는 댓글(P2025)을 삭제하면 404 에러를 반환한다', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: 'test',
    });
    mockedSoftDelete.mockRejectedValue(error);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId, commentId });

    const response = await DELETE(req, params);
    await expectErrorResponse(response, 404, 'COMMENT_NOT_FOUND');
  });

  // 🔥 500 에러 케이스 추가
  it('삭제 중 알 수 없는 에러가 발생하면 500 에러를 반환한다', async () => {
    mockedSoftDelete.mockRejectedValue(new Error('DB Error'));

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId, commentId });

    const response = await DELETE(req, params);
    await expectErrorResponse(response, 500, 'COMMENT_DELETE_FAILED');
  });
});
