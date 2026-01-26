import { POST } from '@/app/api/issues/[issueId]/categorize/route';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { findIssueById } from '@/lib/repositories/issue.repository';
import { categorizeService } from '@/lib/services/categorize.service';
import {
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/repositories/idea.repository');
jest.mock('@/lib/repositories/issue.repository');
jest.mock('@/lib/services/categorize.service');
jest.mock('@/lib/sse/sse-service');
jest.mock('@/lib/utils/broadcast-helpers');

// fetch 모킹
global.fetch = jest.fn();

const mockedFindIdAndContentByIssueId = ideaRepository.findIdAndContentByIssueId as jest.MockedFunction<
  typeof ideaRepository.findIdAndContentByIssueId
>;
const mockedFindIssueById = findIssueById as jest.MockedFunction<typeof findIssueById>;
const mockedCategorizeAndBroadcast = categorizeService.categorizeAndBroadcast as jest.MockedFunction<
  typeof categorizeService.categorizeAndBroadcast
>;
const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('POST /api/issues/[issueId]/categorize', () => {
  const issueId = 'issue-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('아이디어가 없으면 400 에러를 반환한다', async () => {
    const mockIssue = { title: 'Test Issue', topicId: 'topic-1', status: 'SELECT', projectId: null };

    mockedFindIdAndContentByIssueId.mockResolvedValue([]);
    mockedFindIssueById.mockResolvedValue(mockIssue as any);

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 400, 'NO_IDEAS_TO_CATEGORIZE');
  });

  it('이슈가 없으면 400 에러를 반환한다', async () => {
    const mockIdeas = [{ id: 'idea-1', content: 'Idea 1' }];

    mockedFindIdAndContentByIssueId.mockResolvedValue(mockIdeas as any);
    mockedFindIssueById.mockResolvedValue(null);

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 400, 'ISSUE_NOT_FOUND');
  });

  it('AI 응답이 유효하지 않으면 500 에러를 반환한다', async () => {
    const mockIssue = { title: 'Test Issue', topicId: 'topic-1', status: 'SELECT', projectId: null };
    const mockIdeas = [{ id: 'idea-1', content: 'Idea 1' }];

    mockedFindIdAndContentByIssueId.mockResolvedValue(mockIdeas as any);
    mockedFindIssueById.mockResolvedValue(mockIssue as any);
    mockedFetch.mockResolvedValue({
      json: async () => ({ invalid: 'response' }),
    } as Response);

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 500, 'AI_RESPONSE_INVALID');
  });

  it('성공적으로 카테고리화를 수행한다', async () => {
    const mockIssue = { title: 'Test Issue', topicId: 'topic-1', status: 'SELECT', projectId: null };
    const mockIdeas = [
      { id: 'idea-1', content: 'Idea 1' },
      { id: 'idea-2', content: 'Idea 2' },
    ];
    const mockResult = {
      categories: [{ id: 'cat-1' }, { id: 'cat-2' }],
      ideaCategoryMap: { 'idea-1': 'cat-1', 'idea-2': 'cat-2' },
    };

    const mockAIResponse = {
      result: {
        message: {
          toolCalls: [
            {
              function: {
                arguments: {
                  categories: [
                    { categoryName: 'Category 1', ideaIds: ['idea-1'] },
                    { categoryName: 'Category 2', ideaIds: ['idea-2'] },
                  ],
                },
              },
            },
          ],
        },
      },
    };

    mockedFindIdAndContentByIssueId.mockResolvedValue(mockIdeas as any);
    mockedFindIssueById.mockResolvedValue(mockIssue as any);
    mockedFetch.mockResolvedValue({
      json: async () => mockAIResponse,
    } as Response);
    mockedCategorizeAndBroadcast.mockResolvedValue(mockResult);

    const req = createMockRequest({});
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.categories).toHaveLength(2);
  });
});
