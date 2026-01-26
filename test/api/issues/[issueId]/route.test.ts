import { GET } from '@/app/api/issues/[issueId]/route';
import { findIssueById } from '@/lib/repositories/issue.repository';
import {
  createMockGetRequest,
  createMockParams,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/repositories/issue.repository');

const mockedFindIssueById = findIssueById as jest.MockedFunction<typeof findIssueById>;

describe('GET /api/issues/[issueId]', () => {
  const mockIssueId = 'issue-1';
  const mockIssue = {
    id: mockIssueId,
    title: 'Test Issue',
    status: 'SELECT',
    topicId: 'topic-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    closedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('이슈를 성공적으로 조회한다', async () => {
    mockedFindIssueById.mockResolvedValue(mockIssue as any);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId: mockIssueId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.id).toBe(mockIssueId);
    expect(mockedFindIssueById).toHaveBeenCalledWith(mockIssueId);
  });

  it('존재하지 않는 이슈를 조회하면 404 에러를 반환한다', async () => {
    mockedFindIssueById.mockResolvedValue(null);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId: mockIssueId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 404, 'ISSUE_NOT_FOUND');
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    mockedFindIssueById.mockRejectedValue(new Error('Database error'));

    const req = createMockGetRequest();
    const params = createMockParams({ issueId: mockIssueId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 500, 'ISSUE_FETCH_FAILED');
  });
});
