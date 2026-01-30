import { VoteType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { voteRepository } from '@/lib/repositories/vote.repository';
import { voteService } from '@/lib/services/vote.service';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/repositories/vote.repository');

const mockedTransaction = prisma.$transaction as jest.Mock;
const mockedVoteRepository = voteRepository as jest.Mocked<typeof voteRepository>;

describe('voteService.castVote', () => {
  const ideaId = 'idea-1';
  const userId = 'user-1';

  const setupTransaction = () => {
    const tx = { id: 'tx' } as any;
    mockedTransaction.mockImplementation(async (callback: (tx: any) => any) => callback(tx));
    return tx;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('같은 타입을 다시 누르면 투표를 취소한다', async () => {
    const tx = setupTransaction();
    mockedVoteRepository.findActiveVote.mockResolvedValue({ id: 'vote-1', type: 'AGREE' });
    mockedVoteRepository.softDeleteVote.mockResolvedValue({ count: 1 });
    mockedVoteRepository.updateIdeaCounts.mockResolvedValue({ agreeCount: 2, disagreeCount: 1 });

    const result = await voteService.castVote(ideaId, userId, VoteType.AGREE);

    // tx를 제대로 전달했는지에 집중
    expect(mockedVoteRepository.findActiveVote).toHaveBeenCalledWith(ideaId, userId, tx);
    expect(mockedVoteRepository.softDeleteVote).toHaveBeenCalledWith('vote-1', tx);
    expect(mockedVoteRepository.updateIdeaCounts).toHaveBeenCalledWith(
      ideaId,
      { agreeCount: { decrement: 1 } },
      tx,
    );
    // 취소 분기에서는 해당 메서드들이 호출되지 않아야 함
    expect(mockedVoteRepository.createVote).not.toHaveBeenCalled();
    expect(mockedVoteRepository.updateVoteType).not.toHaveBeenCalled();

    expect(result).toEqual({ agreeCount: 2, disagreeCount: 1, myVote: null });
  });

  it('다른 타입을 누르면 투표 타입을 변경한다', async () => {
    const tx = setupTransaction();
    mockedVoteRepository.findActiveVote.mockResolvedValue({ id: 'vote-1', type: 'AGREE' });
    mockedVoteRepository.updateVoteType.mockResolvedValue({ count: 1 });
    mockedVoteRepository.updateIdeaCounts.mockResolvedValue({ agreeCount: 1, disagreeCount: 3 });

    const result = await voteService.castVote(ideaId, userId, VoteType.DISAGREE);

    expect(mockedVoteRepository.findActiveVote).toHaveBeenCalledWith(ideaId, userId, tx);
    expect(mockedVoteRepository.updateVoteType).toHaveBeenCalledWith(
      'vote-1',
      VoteType.AGREE,
      VoteType.DISAGREE,
      tx,
    );
    expect(mockedVoteRepository.updateIdeaCounts).toHaveBeenCalledWith(
      ideaId,
      {
        agreeCount: { decrement: 1 },
        disagreeCount: { increment: 1 },
      },
      tx,
    );
    expect(mockedVoteRepository.createVote).not.toHaveBeenCalled();
    expect(result).toEqual({ agreeCount: 1, disagreeCount: 3, myVote: VoteType.DISAGREE });
  });

  it('기존 투표가 없으면 새 투표를 생성한다', async () => {
    const tx = setupTransaction();
    mockedVoteRepository.findActiveVote.mockResolvedValue(null); //기투표 없음
    mockedVoteRepository.createVote.mockResolvedValue({ id: 'vote-1' } as any); // 새투표
    mockedVoteRepository.updateIdeaCounts.mockResolvedValue({ agreeCount: 10, disagreeCount: 0 });

    const result = await voteService.castVote(ideaId, userId, VoteType.AGREE);

    expect(mockedVoteRepository.findActiveVote).toHaveBeenCalledWith(ideaId, userId, tx);
    expect(mockedVoteRepository.createVote).toHaveBeenCalledWith(
      ideaId,
      userId,
      VoteType.AGREE,
      tx,
    );
    expect(mockedVoteRepository.updateIdeaCounts).toHaveBeenCalledWith(
      ideaId,
      { agreeCount: { increment: 1 } },
      tx,
    );
    expect(result).toEqual({ agreeCount: 10, disagreeCount: 0, myVote: VoteType.AGREE });
  });
});
