import { VoteType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type IdeaVoteSnapshot = {
  id: string;
  agreeCount?: number;
  disagreeCount?: number;
};

type FilterType = 'most-liked' | 'need-discussion' | 'none';

/**
 * 아이디어의 투표 데이터를 바탕으로 찬성, 반대, 총합, 차이 수치를 계산합니다.
 */
const getVoteCounts = (idea: IdeaVoteSnapshot) => {
  const agree = idea.agreeCount ?? 0;
  const disagree = idea.disagreeCount ?? 0;
  const total = agree + disagree;
  const diff = Math.abs(agree - disagree);
  return { agree, disagree, total, diff };
};

export const voteRepository = {
  /**
   * 필터 타입에 따라 하이라이트할 아이디어 ID 목록을 계산하여 Set으로 반환합니다.
   */
  getFilteredIdeaIds(ideas: IdeaVoteSnapshot[], activeFilter: FilterType) {
    // 1. 필터가 없거나 데이터가 없는 경우 빈 Set 즉시 반환
    if (activeFilter === 'none' || ideas.length === 0) return new Set<string>();

    let sorted = [...ideas];

    // 2. 필터 기준에 따라 아이디어 정렬 및 후보군 추출
    if (activeFilter === 'most-liked') {
      // [찬성 많은 순] 찬성-반대 점수(Diff) 순으로 정렬, 점수가 같다면 찬성 표가 많은 순
      sorted.sort((a, b) => {
        const aV = getVoteCounts(a);
        const bV = getVoteCounts(b);
        const aDiff = aV.agree - aV.disagree;
        const bDiff = bV.agree - bV.disagree;
        if (aDiff === bDiff) return bV.agree - aV.agree;
        return bDiff - aDiff;
      });
    } else if (activeFilter === 'need-discussion') {
      // [논의 필요] 찬반 비율 차이가 20% 이내인 후보만 필터링한 후 찬성 순으로 정렬
      const candidates = ideas.filter((idea) => {
        const { total, diff } = getVoteCounts(idea);
        return total > 0 && diff / total <= 0.2;
      });
      sorted = candidates.sort((a, b) => getVoteCounts(b).agree - getVoteCounts(a).agree);
    }

    if (sorted.length === 0) return new Set<string>();

    // 3. 공동 순위 판단을 위한 '3등 기준값' 추출
    const limit = Math.min(sorted.length, 3);
    const thirdStandard = sorted[limit - 1]; // 정렬된 목록의 3위 아이디어
    const thirdAgree = getVoteCounts(thirdStandard).agree;

    // 4. 상위 3위와 그 외 공동 순위 아이디어들 필터링
    const result = sorted.filter((idea, index) => {
      const ideaV = getVoteCounts(idea);
      
      // 투표 참여가 전혀 없는 아이디어는 제외
      if (ideaV.total === 0) return false;

      // 1~3위는 기본적으로 하이라이트에 포함
      if (index < 3) return true;

      // [논의 필요] 3위와 찬성 표수가 동일한 아이디어는 공동 순위로 인정
      if (activeFilter === 'need-discussion') {
        return getVoteCounts(idea).agree === thirdAgree;
      }

      // [찬성 많은 순] 3위와 찬성 표수가 같으면서 찬성-반대 점수도 기준 이상이어야 포함
      const ideaDiff = ideaV.agree - ideaV.disagree;
      const thirdDiff = thirdStandard
        ? getVoteCounts(thirdStandard).agree - getVoteCounts(thirdStandard).disagree
        : 0;

      return ideaV.agree === thirdAgree && ideaDiff >= thirdDiff;
    });

    return new Set(result.map((i) => i.id));
  },
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
