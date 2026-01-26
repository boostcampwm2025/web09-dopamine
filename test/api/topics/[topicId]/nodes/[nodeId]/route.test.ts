import { PATCH } from '@/app/api/topics/[topicId]/nodes/[nodeId]/route';
import { prisma } from '@/lib/prisma';
import {
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    issueNode: {
      update: jest.fn(),
    },
  },
}));

const mockedUpdate = prisma.issueNode.update as jest.MockedFunction<
  typeof prisma.issueNode.update
>;

describe('PATCH /api/topics/[topicId]/nodes/[nodeId]', () => {
  const topicId = 'topic-1';
  const nodeId = 'node-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('positionX나 positionY가 없으면 400 에러를 반환한다', async () => {
    const req = createMockRequest({ positionX: 100 });
    const params = createMockParams({ topicId, nodeId });

    const response = await PATCH(req, params);
    await expectErrorResponse(response, 400, 'POSITION_REQUIRED');
  });

  it('성공적으로 노드 위치를 업데이트한다', async () => {
    const mockNode = {
      id: nodeId,
      issueId: 'issue-1',
      positionX: 150,
      positionY: 250,
    };

    mockedUpdate.mockResolvedValue(mockNode as any);

    const req = createMockRequest({ positionX: 150, positionY: 250 });
    const params = createMockParams({ topicId, nodeId });

    const response = await PATCH(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.id).toBe(nodeId);
    expect(data.positionX).toBe(150);
    expect(data.positionY).toBe(250);
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    mockedUpdate.mockRejectedValue(new Error('Database error'));

    const req = createMockRequest({ positionX: 150, positionY: 250 });
    const params = createMockParams({ topicId, nodeId });

    const response = await PATCH(req, params);
    await expectErrorResponse(response, 500, 'NODE_UPDATE_FAILED');
  });
});
