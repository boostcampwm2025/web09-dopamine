import { Prisma, VoteType } from '@prisma/client';
import { voteRepository } from '@/lib/repositories/vote.repository';

const createMockTx = () =>
  ({
    vote: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    idea: {
      update: jest.fn(),
    },
  }) as unknown as Prisma.TransactionClient;

describe('Vote Repository 테스트', () => {
  it('활성 투표를 찾을 때 삭제되지 않은 투표만 조회한다', async () => {
    // 역할: Soft Delete된 투표가 중복 집계되지 않도록 필터 조건을 보장한다.
    const mockTx = createMockTx();
    (mockTx.vote.findFirst as jest.Mock).mockResolvedValue({ id: 'vote-1' });

    await voteRepository.findActiveVote('idea-1', 'user-1', mockTx);

    expect(mockTx.vote.findFirst).toHaveBeenCalledWith({
      where: { ideaId: 'idea-1', userId: 'user-1', deletedAt: null },
      select: { id: true, type: true },
    });
  });

  it('투표 생성 시 아이디어/유저/타입이 정확히 저장된다', async () => {
    // 역할: 투표 타입이 정확히 기록되어 집계 오류를 방지한다.
    const mockTx = createMockTx();
    (mockTx.vote.create as jest.Mock).mockResolvedValue({ id: 'vote-1' });

    await voteRepository.createVote('idea-1', 'user-1', VoteType.AGREE, mockTx);

    expect(mockTx.vote.create).toHaveBeenCalledWith({
      data: { ideaId: 'idea-1', userId: 'user-1', type: VoteType.AGREE },
    });
  });

  it('투표 타입을 업데이트한다', async () => {
    // 역할: 의견 변경 시 타입 업데이트가 정확히 반영되는지 확인한다.
    const mockTx = createMockTx();
    (mockTx.vote.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    await voteRepository.updateVoteType('vote-1', VoteType.AGREE, VoteType.DISAGREE, mockTx);

    expect(mockTx.vote.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'vote-1',
        type: VoteType.AGREE,
        deletedAt: null,
      },
      data: { type: VoteType.DISAGREE },
    });
  });

  it('투표를 Soft Delete 처리한다', async () => {
    // 역할: 투표 이력은 남기면서 활성 집계에서 제외되도록 한다.
    const mockTx = createMockTx();
    (mockTx.vote.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    await voteRepository.softDeleteVote('vote-1', mockTx);

    const call = (mockTx.vote.updateMany as jest.Mock).mock.calls[0][0];
    expect(call.where).toEqual({ id: 'vote-1', deletedAt: null });
    expect(call.data.deletedAt).toBeInstanceOf(Date);
  });

  it('아이디어의 투표 집계 카운트를 원자적으로 업데이트한다', async () => {
    // 역할: 동시성 상황에서 카운트가 꼬이지 않도록 update/select 구조를 검증한다.
    const mockTx = createMockTx();
    (mockTx.idea.update as jest.Mock).mockResolvedValue({ agreeCount: 2, disagreeCount: 1 });

    const data: Prisma.IdeaUpdateInput = { agreeCount: { increment: 1 } };
    await voteRepository.updateIdeaCounts('idea-1', data, mockTx);

    expect(mockTx.idea.update).toHaveBeenCalledWith({
      where: { id: 'idea-1' },
      data,
      select: { agreeCount: true, disagreeCount: true },
    });
  });
});
