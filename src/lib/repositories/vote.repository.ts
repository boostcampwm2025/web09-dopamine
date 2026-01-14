import { VoteType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const voteRepository = {
  async castVote(ideaId: string, userId: string, voteType: VoteType) {
    const existingVote = await prisma.vote.findFirst({
      where: {
        ideaId,
        userId,
        deletedAt: null,
      },
    });

    return await prisma.$transaction(async (tx) => {
      const selectFields = {
        agreeCount: true,
        disagreeCount: true,
      };

      if (existingVote) {
        // 같은 버튼 클릭 -> 기존 투표 삭제
        if (existingVote.type === voteType) {
          await tx.vote.update({
            where: { id: existingVote.id },
            data: {
              deletedAt: new Date(),
            },
          });

          const updatedIdea = await tx.idea.update({
            where: { id: ideaId },
            data: {
              [voteType === 'AGREE' ? 'agreeCount' : 'disagreeCount']: { decrement: 1 },
            },
            select: selectFields,
          });

          return { ...updatedIdea, myVote: null };
        }

        // 다른 버튼 클릭
        else {
          await tx.vote.update({
            where: { id: existingVote.id },
            data: { type: voteType },
          });

          const updatedIdea = await tx.idea.update({
            where: { id: ideaId },
            data: {
              [existingVote.type === 'AGREE' ? 'agreeCount' : 'disagreeCount']: { decrement: 1 },
              [voteType === 'AGREE' ? 'agreeCount' : 'disagreeCount']: { increment: 1 },
            },
            select: selectFields,
          });
          return { ...updatedIdea, myVote: voteType };
        }
      }

      // 새로운 투표
      else {
        await tx.vote.create({
          data: { ideaId, userId, type: voteType },
        });

        const updatedIdea = await tx.idea.update({
          where: { id: ideaId },
          data: {
            [voteType === 'AGREE' ? 'agreeCount' : 'disagreeCount']: { increment: 1 },
          },
          select: selectFields,
        });
        return { ...updatedIdea, myVote: voteType };
      }
    });
  },
};
