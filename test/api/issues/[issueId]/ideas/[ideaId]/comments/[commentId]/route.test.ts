import { PATCH, DELETE } from '@/app/api/issues/[issueId]/ideas/[ideaId]/comments/[commentId]/route';
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

const mockedUpdate = commentRepository.update as jest.MockedFunction<typeof commentRepository.update>;
const mockedSoftDelete = commentRepository.softDelete as jest.MockedFunction<
  typeof commentRepository.softDelete
>;

describe('PATCH /api/issues/[issueId]/ideas/[ideaId]/comments/[commentId]', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';
  const commentId = 'comment-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('content가 없으면 400 에러를 반환한다', async () => {
    const req = createMockRequest({});
    const params = createMockParams({ issueId, ideaId, commentId });

    const response = await PATCH(req, params);
    await expectErrorResponse(response, 400, 'CONTENT_REQUIRED');
  });

  it('성공적으로 댓글을 수정한다', async () => {
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

    expect(data.id).toBe(commentId);
    expect(data.content).toBe('Updated Comment');
    expect(mockedUpdate).toHaveBeenCalledWith(commentId, 'Updated Comment');
  });

  it('존재하지 않는 댓글을 수정하면 404 에러를 반환한다', async () => {
    const error = new Error('Not found');
    (error as any).code = 'P2025';
    mockedUpdate.mockRejectedValue(error);

    const req = createMockRequest({ content: 'Updated Comment' });
    const params = createMockParams({ issueId, ideaId, commentId });

    const response = await PATCH(req, params);
    await expectErrorResponse(response, 404, 'COMMENT_NOT_FOUND');
  });
});

describe('DELETE /api/issues/[issueId]/ideas/[ideaId]/comments/[commentId]', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';
  const commentId = 'comment-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 댓글을 삭제한다', async () => {
    mockedSoftDelete.mockResolvedValue({
      id: commentId,
      deletedAt: new Date(),
    } as any);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId, commentId });

    const response = await DELETE(req, params);
    await expectSuccessResponse(response, 200);

    expect(mockedSoftDelete).toHaveBeenCalledWith(commentId);
  });

  it('존재하지 않는 댓글을 삭제하면 404 에러를 반환한다', async () => {
    const error = new Error('Not found');
    (error as any).code = 'P2025';
    mockedSoftDelete.mockRejectedValue(error);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId, commentId });

    const response = await DELETE(req, params);
    await expectErrorResponse(response, 404, 'COMMENT_NOT_FOUND');
  });
});
