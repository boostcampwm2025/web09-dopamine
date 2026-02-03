import {
  createMockGetRequest,
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';
import { GET, POST } from '@/app/api/issues/[issueId]/ideas/[ideaId]/comments/route';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { commentRepository } from '@/lib/repositories/comment.repository';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { broadcast } from '@/lib/sse/sse-service';

// 1. 필요한 모든 모듈 모킹
jest.mock('@/lib/repositories/comment.repository');
jest.mock('@/lib/repositories/idea.repository');
jest.mock('@/lib/sse/sse-service');

// Mock 함수 타입 캐스팅
const mockedFindByIdeaId = commentRepository.findByIdeaId as jest.MockedFunction<
  typeof commentRepository.findByIdeaId
>;
const mockedCreate = commentRepository.create as jest.MockedFunction<
  typeof commentRepository.create
>;
const mockedIdeaFindByIssueId = ideaRepository.findByIssueId as jest.MockedFunction<
  typeof ideaRepository.findByIssueId
>;
const mockedBroadcast = broadcast as jest.Mock;

describe('GET /api/issues/[issueId]/ideas/[ideaId]/comments', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 댓글 목록을 조회한다', async () => {
    const mockComments = [
      { id: 'comment-1', content: 'Comment 1', ideaId },
      { id: 'comment-2', content: 'Comment 2', ideaId },
    ];

    mockedFindByIdeaId.mockResolvedValue(mockComments as any);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data).toEqual(mockComments);
    expect(mockedFindByIdeaId).toHaveBeenCalledWith(ideaId, issueId);
  });

  it('댓글 조회 중 에러가 발생하면 500 에러를 반환한다', async () => {
    mockedFindByIdeaId.mockRejectedValue(new Error('DB Error'));

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 500, 'COMMENT_FETCH_FAILED');
  });
});

describe('POST /api/issues/[issueId]/ideas/[ideaId]/comments', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('userId나 content가 없으면 400 에러를 반환한다', async () => {
    const req = createMockRequest({}); // Body 비움
    const params = createMockParams({ issueId, ideaId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 400, 'CONTENT_REQUIRED');
  });

  it('성공적으로 댓글을 생성하고 SSE 이벤트를 전송한다', async () => {
    const mockComment = {
      id: 'comment-1',
      ideaId,
      userId: 'user-1',
      content: 'New Comment',
      createdAt: new Date(),
    };

    // 1. 댓글 생성 모킹
    mockedCreate.mockResolvedValue(mockComment as any);

    // 2. 아이디어 조회 모킹 (댓글 수 계산용)
    mockedIdeaFindByIssueId.mockResolvedValue([
      { id: ideaId, commentCount: 10 } as any, // 현재 아이디어의 댓글 수 10개 가정
    ]);

    const req = createMockRequest({ userId: 'user-1', content: 'New Comment' });
    const params = createMockParams({ issueId, ideaId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 201);

    // 검증 1: 응답 데이터
    expect(data.id).toBe('comment-1');

    // 검증 2: Repository 호출
    expect(mockedCreate).toHaveBeenCalledWith({
      ideaId,
      userId: 'user-1',
      content: 'New Comment',
      issueId,
    });

    // 검증 3: SSE Broadcast 호출 (중요!)
    expect(mockedBroadcast).toHaveBeenCalledWith({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.COMMENT_CREATED,
        data: {
          ideaId,
          commentId: 'comment-1',
          commentCount: 10, // 위에서 모킹한 값
        },
      },
    });
  });

  it('댓글 생성 중 에러가 발생하면 500 에러를 반환한다', async () => {
    mockedCreate.mockRejectedValue(new Error('DB Create Failed'));

    const req = createMockRequest({ userId: 'user-1', content: 'Fail' });
    const params = createMockParams({ issueId, ideaId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 500, 'COMMENT_CREATE_FAILED');

    // 에러 발생 시 브로드캐스트는 실행되지 않아야 함
    expect(mockedBroadcast).not.toHaveBeenCalled();
  });
});
