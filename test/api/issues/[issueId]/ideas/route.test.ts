import { GET, POST } from '@/app/api/issues/[issueId]/ideas/route';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { ideaFilterService } from '@/lib/services/idea-filter.service';
import {
  createMockGetRequest,
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: () => ({}),
}));
jest.mock('@/lib/repositories/idea.repository');
jest.mock('@/lib/services/idea-filter.service');
jest.mock('@/lib/sse/sse-service');

const mockedFindByIssueId = ideaRepository.findByIssueId as jest.MockedFunction<
  typeof ideaRepository.findByIssueId
>;
const mockedCreate = ideaRepository.create as jest.MockedFunction<typeof ideaRepository.create>;
const mockedGetFilteredIdeaIds = ideaFilterService.getFilteredIdeaIds as jest.MockedFunction<
  typeof ideaFilterService.getFilteredIdeaIds
>;

describe('GET /api/issues/[issueId]/ideas', () => {
  const issueId = 'issue-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 아이디어 목록을 조회한다', async () => {
    const mockIdeas = [
      { id: 'idea-1', content: 'Idea 1', agreeCount: 5, disagreeCount: 2 },
      { id: 'idea-2', content: 'Idea 2', agreeCount: 3, disagreeCount: 1 },
    ];

    mockedFindByIssueId.mockResolvedValue(mockIdeas as any);

    const req = createMockGetRequest({ url: `http://localhost:3000?filter=none` });
    const params = createMockParams({ issueId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data).toEqual(mockIdeas);
    expect(mockedFindByIssueId).toHaveBeenCalledWith(issueId);
  });

  it('필터가 적용된 아이디어 ID 목록을 반환한다', async () => {
    const mockIdeas = [
      { id: 'idea-1', agreeCount: 5, disagreeCount: 2 },
      { id: 'idea-2', agreeCount: 3, disagreeCount: 1 },
    ];
    const filteredIds = new Set(['idea-1']);

    mockedFindByIssueId.mockResolvedValue(mockIdeas as any);
    mockedGetFilteredIdeaIds.mockReturnValue(filteredIds);

    const req = createMockGetRequest({ url: `http://localhost:3000?filter=most_agreed` });
    const params = createMockParams({ issueId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.filteredIds).toEqual(['idea-1']);
  });
});

describe('POST /api/issues/[issueId]/ideas', () => {
  const issueId = 'issue-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 아이디어를 생성한다', async () => {
    const mockIdea = {
      id: 'idea-1',
      issueId,
      content: 'New Idea',
      userId: 'user-1',
      positionX: 100,
      positionY: 200,
    };

    mockedCreate.mockResolvedValue(mockIdea as any);

    const req = createMockRequest({
      content: 'New Idea',
      userId: 'user-1',
      positionX: 100,
      positionY: 200,
    });
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 201);

    expect(data.id).toBe('idea-1');
    expect(mockedCreate).toHaveBeenCalledWith({
      issueId,
      userId: 'user-1',
      content: 'New Idea',
      positionX: 100,
      positionY: 200,
      categoryId: undefined,
    });
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    mockedCreate.mockRejectedValue(new Error('Database error'));

    const req = createMockRequest({ content: 'New Idea', userId: 'user-1' });
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 500, 'IDEA_CREATE_FAILED');
  });
});
