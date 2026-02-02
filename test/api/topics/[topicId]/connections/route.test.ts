import {
  createMockGetRequest,
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';
import { GET, POST } from '@/app/api/topics/[topicId]/connections/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    issueConnection: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

const mockedFindMany = prisma.issueConnection.findMany as jest.MockedFunction<
  typeof prisma.issueConnection.findMany
>;
const mockedCreate = prisma.issueConnection.create as jest.MockedFunction<
  typeof prisma.issueConnection.create
>;
const mockedFindFirst = prisma.issueConnection.findFirst as jest.MockedFunction<
  typeof prisma.issueConnection.findFirst
>;

describe('GET /api/topics/[topicId]/connections', () => {
  const topicId = 'topic-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 연결 목록을 조회한다', async () => {
    const mockConnections = [
      {
        id: 'conn-1',
        sourceIssueId: 'issue-1',
        targetIssueId: 'issue-2',
        sourceHandle: 'source',
        targetHandle: 'target',
      },
    ];

    mockedFindMany.mockResolvedValue(mockConnections as any);

    const req = createMockGetRequest();
    const params = createMockParams({ topicId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data).toHaveLength(1);
    expect(data[0].id).toBe('conn-1');
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    mockedFindMany.mockRejectedValue(new Error('Database error'));

    const req = createMockGetRequest();
    const params = createMockParams({ topicId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 500, 'CONNECTIONS_FETCH_FAILED');
  });
});

describe('POST /api/topics/[topicId]/connections', () => {
  const topicId = 'topic-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sourceIssueId나 targetIssueId가 없으면 400 에러를 반환한다', async () => {
    const req = createMockRequest({ sourceIssueId: 'issue-1' });
    const params = createMockParams({ topicId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 400, 'ISSUE_IDS_REQUIRED');
  });

  it('성공적으로 연결을 생성한다', async () => {
    const mockConnection = {
      id: 'conn-1',
      sourceIssueId: 'issue-1',
      targetIssueId: 'issue-2',
      sourceHandle: 'source',
      targetHandle: 'target',
    };

    mockedFindFirst.mockResolvedValue(null);
    mockedCreate.mockResolvedValue(mockConnection as any);

    const req = createMockRequest({
      sourceIssueId: 'issue-1',
      targetIssueId: 'issue-2',
      sourceHandle: 'source',
      targetHandle: 'target',
    });
    const params = createMockParams({ topicId });

    const response = await POST(req, params);
    const data = await expectSuccessResponse(response, 201);

    expect(data.id).toBe('conn-1');
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    mockedFindFirst.mockResolvedValue(null);
    mockedCreate.mockRejectedValue(new Error('Database error'));

    const req = createMockRequest({
      sourceIssueId: 'issue-1',
      targetIssueId: 'issue-2',
    });
    const params = createMockParams({ topicId });

    const response = await POST(req, params);
    await expectErrorResponse(response, 500, 'CONNECTION_CREATE_FAILED');
  });
});
