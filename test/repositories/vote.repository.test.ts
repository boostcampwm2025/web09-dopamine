import { VoteType } from '@prisma/client';
import { voteRepository } from '@/lib/repositories/vote.repository';

describe('Vote Repository 테스트', () => {
  let mockTx: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Prisma Transaction Client 모킹
    mockTx = {
      vote: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      idea: {
        update: jest.fn(),
      },
    };
  });

  // 1. 투표 생성 테스트 (에러 발생했던 부분)
  it('투표 생성 시 아이디어/유저/타입과 함께 isActive: true가 저장된다', async () => {
    // Given
    const ideaId = 'idea-1';
    const userId = 'user-1';
    const type = VoteType.AGREE;

    // When
    await voteRepository.createVote(ideaId, userId, type, mockTx);

    // Then
    expect(mockTx.vote.create).toHaveBeenCalledWith({
      data: {
        ideaId,
        userId,
        type,
        isActive: true,
      },
    });
  });

  // 2. 활성 투표 조회 테스트
  it('사용자의 활성(isActive: true) 투표만 찾아야 한다', async () => {
    const ideaId = 'idea-1';
    const userId = 'user-1';

    await voteRepository.findActiveVote(ideaId, userId, mockTx);

    expect(mockTx.vote.findFirst).toHaveBeenCalledWith({
      where: {
        ideaId,
        userId,
        isActive: true,
      },
      select: { id: true, type: true },
    });
  });

  // 3. 투표 삭제 (Soft Delete) 테스트
  it('투표 삭제 시 deletedAt을 기록하고 isActive를 null로 변경한다', async () => {
    const voteId = 'vote-1';

    await voteRepository.softDeleteVote(voteId, mockTx);

    expect(mockTx.vote.update).toHaveBeenCalledWith({
      where: { id: voteId },
      data: {
        deletedAt: expect.any(Date),
        isActive: null,
      },
    });
  });

  // 4. 투표 카운트 조회 테스트
  it('아이디어의 동의/반대 카운트 조회 시 활성 투표만 집계한다', async () => {
    const ideaId = 'idea-1';
    mockTx.vote.count.mockResolvedValue(10); // 가짜 카운트

    await voteRepository.getVoteCounts(ideaId, mockTx);

    // AGREE와 DISAGREE 각각에 대해 isActive: true 조건이 붙는지 확인
    expect(mockTx.vote.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ideaId, type: VoteType.AGREE, isActive: true },
      }),
    );
    expect(mockTx.vote.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ideaId, type: VoteType.DISAGREE, isActive: true },
      }),
    );
  });

  // 5. 아이디어 테이블 카운트 업데이트 테스트
  it('아이디어 테이블의 투표 카운트를 원자적으로 업데이트한다', async () => {
    const ideaId = 'idea-1';
    const updateData = { agreeCount: { increment: 1 } };

    await voteRepository.updateIdeaCounts(ideaId, updateData, mockTx);

    expect(mockTx.idea.update).toHaveBeenCalledWith({
      where: { id: ideaId },
      data: updateData,
      select: { agreeCount: true, disagreeCount: true },
    });
  });
});
