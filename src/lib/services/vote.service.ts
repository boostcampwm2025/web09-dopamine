import { VoteType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { voteRepository } from '../repositories/vote.repository';
import { countField } from '../utils/vote';

export const voteService = {
  async castVote(ideaId: string, userId: string, voteType: VoteType) {
    return await prisma.$transaction(async (tx) => {
      // 1. 기존 투표 확인
      const existing = await voteRepository.findActiveVote(ideaId, userId, tx);

      // 2. 상황별 로직 처리

      // CASE A: 투표 취소 (같은 버튼을 다시 누름)
      if (existing && existing.type === voteType) {
        await voteRepository.softDeleteVote(existing.id, tx);
        const idea = await voteRepository.updateIdeaCounts(
          ideaId,
          {
            [countField(voteType)]: { decrement: 1 },
          },
          tx,
        );
        return { ...idea, myVote: null };
      }

      // CASE B: 투표 변경 (AGREE <-> DISAGREE)
      if (existing && existing.type !== voteType) {
        await voteRepository.updateVoteType(existing.id, voteType, tx);
        const idea = await voteRepository.updateIdeaCounts(
          ideaId,
          {
            [countField(existing.type)]: { decrement: 1 },
            [countField(voteType)]: { increment: 1 },
          },
          tx,
        );
        return { ...idea, myVote: voteType };
      }

      // CASE C: 첫 투표
      await voteRepository.createVote(ideaId, userId, voteType, tx);
      const idea = await voteRepository.updateIdeaCounts(
        ideaId,
        {
          [countField(voteType)]: { increment: 1 },
        },
        tx,
      );
      return { ...idea, myVote: voteType };
    });
  },
};
