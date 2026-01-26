import { DELETE } from '@/app/api/topics/[topicId]/connections/[connectionId]/route';
import { prisma } from '@/lib/prisma';
import {
  createMockGetRequest,
  createMockParams,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    issueConnection: {
      update: jest.fn(),
    },
  },
}));

const mockedUpdate = prisma.issueConnection.update as jest.MockedFunction<
  typeof prisma.issueConnection.update
>;

describe('DELETE /api/topics/[topicId]/connections/[connectionId]', () => {
  const topicId = 'topic-1';
  const connectionId = 'conn-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 연결을 삭제한다', async () => {
    mockedUpdate.mockResolvedValue({
      id: connectionId,
      deletedAt: new Date(),
    } as any);

    const req = createMockGetRequest();
    const params = createMockParams({ topicId, connectionId });

    const response = await DELETE(req, params);
    await expectSuccessResponse(response, 200);

    expect(mockedUpdate).toHaveBeenCalledWith({
      where: { id: connectionId },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    mockedUpdate.mockRejectedValue(new Error('Database error'));

    const req = createMockGetRequest();
    const params = createMockParams({ topicId, connectionId });

    const response = await DELETE(req, params);
    await expectErrorResponse(response, 500, 'CONNECTION_DELETE_FAILED');
  });
});
