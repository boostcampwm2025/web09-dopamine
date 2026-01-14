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
    });
  },
};
