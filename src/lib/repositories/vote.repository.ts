import { Prisma, VoteType } from '@prisma/client';

export const voteRepository = {
  // 사용자의 활성 투표 찾기
  findActiveVote(ideaId: string, userId: string, tx: Prisma.TransactionClient) {
    return tx.vote.findFirst({
      where: { ideaId, userId, deletedAt: null },
      select: { id: true, type: true },
    });
  },

  // 투표 생성
  createVote(ideaId: string, userId: string, type: VoteType, tx: Prisma.TransactionClient) {
    return tx.vote.create({ data: { ideaId, userId, type } });
  },

  // 투표 타입 변경
  // 투표 타입 변경 (낙관적 락 지원: oldType 확인 및 count 반환)
  updateVoteType(voteId: string, oldType: VoteType, newType: VoteType, tx: Prisma.TransactionClient) {
    return tx.vote.updateMany({
      where: {
        id: voteId,
        type: oldType,
        deletedAt: null,
      },
      data: { type: newType },
    });
  },

  // 투표 삭제 (Soft Delete)
  // 투표 삭제 (낙관적 락 지원: deletedAt 확인 및 count 반환)
  softDeleteVote(voteId: string, tx: Prisma.TransactionClient) {
    return tx.vote.updateMany({
      where: {
        id: voteId,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });
  },

  // 아이디어 테이블의 카운트 업데이트 (atomic increment/decrement)
  updateIdeaCounts(ideaId: string, data: Prisma.IdeaUpdateInput, tx: Prisma.TransactionClient) {
    return tx.idea.update({
      where: { id: ideaId },
      data,
      select: { agreeCount: true, disagreeCount: true },
    });
  },
};
