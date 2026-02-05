import { prisma } from '@/lib/prisma';
import {
  createTopic,
  findTopicById,
  findTopicWithPermissionData,
  softDeleteTopic,
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
    issue: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    idea: { updateMany: jest.fn() },
    category: { updateMany: jest.fn() },
    issueMember: { updateMany: jest.fn() },
    issueNode: { updateMany: jest.fn() },
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
    mockedTopic.findUnique.mockResolvedValue({ id: 'topic-1' } as any);

    await findTopicById('topic-1');

    expect(mockedTopic.findUnique).toHaveBeenCalledWith({
      where: { id: 'topic-1', deletedAt: null },
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

  describe('softDeleteTopic', () => {
    const mockIssueIds = [{ id: 'issue-1' }, { id: 'issue-2' }];

    const setupTransactionMock = (mockTx: any) => {
      mockedTransaction.mockImplementation(async (callback: (tx: any) => any) => callback(mockTx));
    };

    it('토픽에 이슈가 있는 경우, 연관된 모든 데이터(아이디어, 카테고리 등)를 함께 삭제한다', async () => {
      const mockTx = {
        issue: {
          findMany: jest.fn().mockResolvedValue(mockIssueIds),
          updateMany: jest.fn().mockResolvedValue({ count: 2 }),
        },
        idea: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
        category: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
        issueMember: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
        issueNode: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
        topic: {
          update: jest.fn().mockResolvedValue({ id: topicId, projectId: 'p1' }),
        },
      };

      setupTransactionMock(mockTx);

      const result = await softDeleteTopic(topicId);

      // 1. 이슈 조회 확인
      expect(mockTx.issue.findMany).toHaveBeenCalledWith({
        where: { topicId, deletedAt: null },
        select: { id: true },
      });

      // 2. 연관 데이터(updateMany) 호출 확인
      const expectedIds = ['issue-1', 'issue-2'];
      expect(mockTx.idea.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { issueId: { in: expectedIds }, deletedAt: null } }),
      );

      // 3. 이슈 및 토픽 최종 삭제 확인
      expect(mockTx.issue.updateMany).toHaveBeenCalled();
      expect(mockTx.topic.update).toHaveBeenCalledWith({
        where: { id: topicId },
        data: { deletedAt: expect.any(Date) },
        select: { id: true, projectId: true },
      });

      expect(result.id).toBe(topicId);
    });

    it('토픽에 이슈가 하나도 없는 경우, 이슈 관련 하위 데이터 삭제는 건너뛰어야 한다', async () => {
      const mockTx = {
        issue: {
          findMany: jest.fn().mockResolvedValue([]), // 이슈 없음
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        idea: { updateMany: jest.fn() },
        topic: {
          update: jest.fn().mockResolvedValue({ id: topicId }),
        },
      };

      setupTransactionMock(mockTx);

      await softDeleteTopic(topicId);

      // 이슈가 없으므로 idea.updateMany는 호출되지 않아야 함
      expect(mockTx.idea.updateMany).not.toHaveBeenCalled();
      // 하지만 토픽 삭제는 실행되어야 함
      expect(mockTx.topic.update).toHaveBeenCalled();
    });

    it('트랜잭션 에러 발생 시 예외를 던져야 한다', async () => {
      mockedTransaction.mockRejectedValue(new Error('Transaction Failed'));
      await expect(softDeleteTopic(topicId)).rejects.toThrow('Transaction Failed');
    });
  });
});
