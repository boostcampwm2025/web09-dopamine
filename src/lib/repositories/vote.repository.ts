import { Prisma, VoteType } from '@prisma/client';

export const voteRepository = {
  // 사용자의 활성 투표 찾기
  findActiveVote(ideaId: string, userId: string, tx: Prisma.TransactionClient) {
    return tx.vote.findFirst({
      where: { ideaId, userId, isActive: true },
      select: { id: true, type: true },
    });
  },

  // 투표 생성
  createVote(ideaId: string, userId: string, type: VoteType, tx: Prisma.TransactionClient) {
    return tx.vote.create({ data: { ideaId, userId, type, isActive: true } });
  },

  // 투표 타입 변경
  updateVoteType(voteId: string, type: VoteType, tx: Prisma.TransactionClient) {
    return tx.vote.update({
      where: { id: voteId },
      data: { type },
      select: { id: true, type: true },
    });
  },

  // 투표 삭제 (Soft Delete)
  softDeleteVote(voteId: string, tx: Prisma.TransactionClient) {
    return tx.vote.update({
      where: { id: voteId },
      data: { deletedAt: new Date(), isActive: null },
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
