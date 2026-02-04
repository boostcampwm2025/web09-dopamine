import { Prisma, VoteType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { voteRepository } from '../repositories/vote.repository';
import { countField } from '../utils/vote';

type VoteState = VoteType | null;

type VoteTransition =
  | { action: 'CREATE'; next: VoteType }
  | { action: 'CANCEL'; prev: VoteType }
  | { action: 'CHANGE'; prev: VoteType; next: VoteType };

// 현재 투표 상태 + 사용자가 누른 버튼을 보고 다음 상태가 무엇인지 결정하는 함수
function resolveVoteTransition(current: VoteState, clicked: VoteType): VoteTransition {
  if (current === null) {
    return { action: 'CREATE', next: clicked };
  }

  if (current === clicked) {
    return { action: 'CANCEL', prev: current };
  }

  return {
    action: 'CHANGE',
    prev: current,
    next: clicked,
  };
}

async function applyVoteTransition(
  tx: Prisma.TransactionClient,
  ideaId: string,
  userId: string,
  transition: VoteTransition,
) {
  switch (transition.action) {
    case 'CREATE': {
      await voteRepository.createVote(ideaId, userId, transition.next, tx);

      return {
        [countField(transition.next)]: { increment: 1 },
        myVote: transition.next,
      };
    }

    case 'CANCEL': {
      const existing = await voteRepository.findActiveVote(ideaId, userId, tx);
      if (!existing) {
        throw new Error('Invalid state: cancel without vote');
      }

      await voteRepository.softDeleteVote(existing.id, tx);

      return {
        [countField(transition.prev)]: { decrement: 1 },
        myVote: null,
      };
    }

    case 'CHANGE': {
      const existing = await voteRepository.findActiveVote(ideaId, userId, tx);
      if (!existing) {
        throw new Error('Invalid state: change without vote');
      }

      await voteRepository.updateVoteType(existing.id, transition.next, tx);

      return {
        [countField(transition.prev)]: { decrement: 1 },
        [countField(transition.next)]: { increment: 1 },
        myVote: transition.next,
      };
    }
  }
}

export const voteService = {
  async castVote(ideaId: string, userId: string, voteType: VoteType) {
    const MAX_RETRY = 3;

    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
      try {
        return await prisma.$transaction(async (tx) => {
          // 1. 현재 상태 조회
          const existing = await voteRepository.findActiveVote(ideaId, userId, tx);

          // 2. 상태 전이 결정
          const transition = resolveVoteTransition(existing?.type ?? null, voteType);

          // 3. vote 상태 변경
          const { myVote } = await applyVoteTransition(tx, ideaId, userId, transition);

          // 4. vote 기준으로 카운트 재계산
          const { agreeCount, disagreeCount } = await voteRepository.getVoteCounts(ideaId, tx);

          // 5. idea 업데이트
          const idea = await voteRepository.updateIdeaCounts(
            ideaId,
            { agreeCount, disagreeCount },
            tx,
          );

          return { ...idea, myVote };
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          (e.code === 'P2002' || e.code === 'P2034') &&
          attempt < MAX_RETRY - 1
        ) {
          continue;
        }
        throw e;
      }
    }

    throw new Error('Unreachable: vote transaction retry exhausted');
  },
};
