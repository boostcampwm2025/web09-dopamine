import { prisma } from '@/lib/prisma';
import {
  createTopic,
  findTopicById,
  findTopicWithPermissionData,
  updateTopicTitle,
} from '@/lib/repositories/topic.repository';
import { PrismaTransaction } from '@/types/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    topic: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockedTopic = prisma.topic as jest.Mocked<typeof prisma.topic>;
const mockedTransaction = prisma.$transaction as jest.Mock;

describe('Topic Repository 테스트', () => {
  const topicId = 'topic-1';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('토픽 생성 시 트랜잭션으로 저장하고 필요한 필드를 반환한다', async () => {
    // 역할: 토픽 생성 결과가 API 응답에 필요한 필드만 포함하는지 보장한다.
    const now = new Date();
    const mockTx = {
      topic: {
        create: jest.fn().mockResolvedValue({
          id: 'topic-1',
          title: '토픽',
          projectId: 'project-1',
          createdAt: now,
        }),
      },
    } as unknown as PrismaTransaction;

    mockedTransaction.mockImplementation(async (callback: (tx: PrismaTransaction) => any) =>
      callback(mockTx),
    );

    const result = await createTopic('토픽', 'project-1');

    expect(mockedTransaction).toHaveBeenCalled();
    expect(mockTx.topic.create).toHaveBeenCalledWith({
      data: { projectId: 'project-1', title: '토픽' },
    });
    expect(result).toEqual({
      id: 'topic-1',
      title: '토픽',
      projectId: 'project-1',
      createdAt: now,
    });
  });

  it('토픽 ID로 토픽을 조회한다', async () => {
    // 역할: 상세 조회에서 정확한 ID 조건이 사용되는지 확인한다.
    mockedTopic.findUnique.mockResolvedValue({ id: 'topic-1' } as any);

    await findTopicById('topic-1');

    expect(mockedTopic.findUnique).toHaveBeenCalledWith({
      where: { id: 'topic-1' },
    });
  });
  describe('findTopicWithPermissionData', () => {
    it('삭제되지 않은 토픽과 유저의 프로젝트 멤버 여부를 조회해야 한다', async () => {
      await findTopicWithPermissionData(topicId, userId);

      expect(prisma.topic.findUnique).toHaveBeenCalledWith({
        where: { id: topicId, deletedAt: null },
        select: expect.objectContaining({
          project: {
            select: {
              projectMembers: {
                where: { userId },
                select: { id: true },
              },
            },
          },
        }),
      });
    });
  });

  describe('updateTopicTitle', () => {
    it('토픽 제목을 업데이트하고 필요한 필드를 반환해야 한다', async () => {
      const newTitle = 'New Title';
      await updateTopicTitle(topicId, newTitle);

      expect(prisma.topic.update).toHaveBeenCalledWith({
        where: { id: topicId },
        data: { title: newTitle },
        select: { id: true, title: true },
      });
    });
  });
});
