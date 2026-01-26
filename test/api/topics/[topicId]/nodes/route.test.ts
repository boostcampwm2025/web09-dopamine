import { GET } from '@/app/api/topics/[topicId]/nodes/route';
import { prisma } from '@/lib/prisma';
import {
  createMockGetRequest,
  createMockParams,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    issueNode: {
      findMany: jest.fn(),
    },
  },
}));

const mockedFindMany = prisma.issueNode.findMany as jest.MockedFunction<
  typeof prisma.issueNode.findMany
>;

describe('GET /api/topics/[topicId]/nodes', () => {
  const topicId = 'topic-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 노드 목록을 조회한다', async () => {
    const mockNodes = [
      { id: 'node-1', issueId: 'issue-1', positionX: 100, positionY: 200 },
      { id: 'node-2', issueId: 'issue-2', positionX: 300, positionY: 400 },
    ];

    mockedFindMany.mockResolvedValue(mockNodes as any);

    const req = createMockGetRequest();
    const params = createMockParams({ topicId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data).toHaveLength(2);
    expect(data[0].id).toBe('node-1');
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    mockedFindMany.mockRejectedValue(new Error('Database error'));

    const req = createMockGetRequest();
    const params = createMockParams({ topicId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 500, 'NODES_FETCH_FAILED');
  });
});
