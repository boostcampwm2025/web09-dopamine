import { GET, POST } from '@/app/api/issues/[issueId]/ideas/[ideaId]/comments/route';
import { commentRepository } from '@/lib/repositories/comment.repository';
import {
  createMockGetRequest,
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/repositories/comment.repository');
jest.mock('@/lib/sse/sse-service');

const mockedFindByIdeaId = commentRepository.findByIdeaId as jest.MockedFunction<
  typeof commentRepository.findByIdeaId
>;
const mockedCreate = commentRepository.create as jest.MockedFunction<typeof commentRepository.create>;

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
    expect(mockedFindByIdeaId).toHaveBeenCalledWith(ideaId);
  });
});

describe('POST /api/issues/[issueId]/ideas/[ideaId]/comments', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('userId나 content가 없으면 400 에러를 반환한다', async () => {
    const req = createMockRequest({});
    const params = createMockParams({ issueId, ideaId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 400, 'CONTENT_REQUIRED');
  });

  it('성공적으로 댓글을 생성한다', async () => {
    const mockComment = {
      id: 'comment-1',
      ideaId,
      userId: 'user-1',
      content: 'New Comment',
    };

    mockedCreate.mockResolvedValue(mockComment as any);

    const req = createMockRequest({ userId: 'user-1', content: 'New Comment' });
    const params = createMockParams({ issueId, ideaId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 201);

    expect(data.id).toBe('comment-1');
    expect(mockedCreate).toHaveBeenCalledWith({
      ideaId,
      userId: 'user-1',
      content: 'New Comment',
    });
  });
});
