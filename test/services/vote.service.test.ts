import { Prisma, VoteType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { voteRepository } from '@/lib/repositories/vote.repository';
import { voteService } from '@/lib/services/vote.service';

// 1. 모듈 전체 모킹
jest.mock('@/lib/repositories/vote.repository');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

const mockedVoteRepository = voteRepository as jest.Mocked<typeof voteRepository>;

describe('voteService.castVote (Refactored)', () => {
  const ideaId = 'idea-1';
  const userId = 'user-1';
  let mockTx: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTx = {
      vote: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
      idea: { update: jest.fn() },
    };

    // prisma.$transaction이 콜백을 실행하도록 설정
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return await callback(mockTx);
    });

    // 카운트 재계산 및 아이디어 업데이트 모킹
    mockedVoteRepository.getVoteCounts.mockResolvedValue({ agreeCount: 1, disagreeCount: 0 });
    mockedVoteRepository.updateIdeaCounts.mockResolvedValue({
      id: ideaId,
      agreeCount: 1,
      disagreeCount: 0,
    } as any);
  });

  test('기존 투표가 없으면 CREATE 액션을 수행하고 새 투표를 생성한다', async () => {
    // 1. 현재 상태 조회 결과: null
    mockedVoteRepository.findActiveVote.mockResolvedValue(null);

    // 실행
    const result = await voteService.castVote(ideaId, userId, VoteType.AGREE);

    // 검증: createVote 호출 확인
    expect(mockedVoteRepository.createVote).toHaveBeenCalledWith(
      ideaId,
      userId,
      VoteType.AGREE,
      mockTx,
    );
    expect(result.myVote).toBe(VoteType.AGREE);
  });

  test('기존 투표와 같은 타입을 누르면 CANCEL 액션을 수행하고 투표를 삭제한다', async () => {
    // 1. 현재 상태 조회 결과: AGREE
    const mockExisting = { id: 'v1', type: VoteType.AGREE };
    mockedVoteRepository.findActiveVote.mockResolvedValue(mockExisting as any);

    // 실행: 다시 AGREE 클릭
    const result = await voteService.castVote(ideaId, userId, VoteType.AGREE);

    // 검증: softDeleteVote 호출 확인
    expect(mockedVoteRepository.softDeleteVote).toHaveBeenCalledWith('v1', mockTx);
    expect(result.myVote).toBeNull();
  });

  test('기존 투표와 다른 타입을 누르면 CHANGE 액션을 수행하고 타입을 변경한다', async () => {
    // 1. 현재 상태 조회 결과: AGREE
    const mockExisting = { id: 'v1', type: VoteType.AGREE };
    mockedVoteRepository.findActiveVote.mockResolvedValue(mockExisting as any);

    // 실행: DISAGREE 클릭
    const result = await voteService.castVote(ideaId, userId, VoteType.DISAGREE);

    // 검증: updateVoteType 호출 확인
    expect(mockedVoteRepository.updateVoteType).toHaveBeenCalledWith(
      'v1',
      VoteType.DISAGREE,
      mockTx,
    );
    expect(result.myVote).toBe(VoteType.DISAGREE);
  });

  test('트랜잭션 충돌(P2034) 발생 시 재시도 후 성공해야 한다', async () => {
    mockedVoteRepository.findActiveVote.mockResolvedValue(null);

    // 첫 번째 시도는 에러, 두 번째는 성공하도록 설정
    (prisma.$transaction as jest.Mock)
      .mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Conflict', {
          code: 'P2034',
          clientVersion: '5.x',
        }),
      )
      .mockImplementationOnce(async (callback) => await callback(mockTx));

    const result = await voteService.castVote(ideaId, userId, VoteType.AGREE);

    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(result.myVote).toBe(VoteType.AGREE);
  });
});
