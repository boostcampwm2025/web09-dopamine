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

  it('중복된 카테고리 이름이 포함된 AI 응답을 처리한다', async () => {
    const mockIssue = { title: 'Test Issue', topicId: 'topic-1', status: 'SELECT', projectId: null };
    const mockIdeas = [
      { id: 'idea-1', content: 'Idea 1' },
      { id: 'idea-2', content: 'Idea 2' },
    ];
    // 서비스 결과는 이미 합쳐진 상태로 반환된다고 가정 (서비스 단위 테스트에서 이미 검증됨)
    const mockResult = {
      categories: [{ id: 'cat-1', title: 'Category A' }],
      ideaCategoryMap: { 'idea-1': 'cat-1', 'idea-2': 'cat-1' },
    };

    const mockAIResponse = {
      result: {
        message: {
          toolCalls: [
            {
              function: {
                arguments: {
                  categories: [
                    { categoryName: 'Category A', ideaIds: ['idea-1'] },
                    { categoryName: 'Category A', ideaIds: ['idea-2'] }, // 중복된 이름
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

    // 서비스가 하나로 합친 결과를 그대로 반환하는지 확인
    expect(data.categories).toHaveLength(1);
    expect(data.categories[0].title).toBe('Category A');
    expect(mockedCategorizeAndBroadcast).toHaveBeenCalledWith(
      issueId,
      [
        { title: 'Category A', ideaIds: ['idea-1'] },
        { title: 'Category A', ideaIds: ['idea-2'] },
      ], // 라우트 핸들러는 AI 응답 그대로 서비스로 전달함
    );
  });
});
