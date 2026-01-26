import { GET, POST } from '@/app/api/issues/[issueId]/categories/route';
import { categoryRepository } from '@/lib/repositories/category.repository';
import {
  createMockGetRequest,
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/repositories/category.repository');
jest.mock('@/lib/sse/sse-service');

const mockedFindByIssueId = categoryRepository.findByIssueId as jest.MockedFunction<
  typeof categoryRepository.findByIssueId
>;
const mockedCreate = categoryRepository.create as jest.MockedFunction<typeof categoryRepository.create>;

describe('GET /api/issues/[issueId]/categories', () => {
  const issueId = 'issue-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 카테고리 목록을 조회한다', async () => {
    const mockCategories = [
      { id: 'cat-1', title: 'Category 1', issueId },
      { id: 'cat-2', title: 'Category 2', issueId },
    ];

    mockedFindByIssueId.mockResolvedValue(mockCategories as any);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data).toEqual(mockCategories);
    expect(mockedFindByIssueId).toHaveBeenCalledWith(issueId);
  });
});

describe('POST /api/issues/[issueId]/categories', () => {
  const issueId = 'issue-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 카테고리를 생성한다', async () => {
    const mockCategory = {
      id: 'cat-1',
      issueId,
      title: 'New Category',
      positionX: 100,
      positionY: 200,
      width: 300,
      height: 400,
    };

    mockedCreate.mockResolvedValue(mockCategory as any);

    const req = createMockRequest({
      title: 'New Category',
      positionX: 100,
      positionY: 200,
      width: 300,
      height: 400,
    });
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 201);

    expect(data.id).toBe('cat-1');
    expect(mockedCreate).toHaveBeenCalledWith({
      issueId,
      title: 'New Category',
      positionX: 100,
      positionY: 200,
      width: 300,
      height: 400,
    });
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    mockedCreate.mockRejectedValue(new Error('Database error'));

    const req = createMockRequest({ title: 'New Category' });
    const params = createMockParams({ issueId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 500, 'CATEGORY_CREATE_FAILED');
  });
});
