import { prisma } from '@/lib/prisma';
import { Prisma, VoteType } from '@prisma/client';

type IdeaFilterType = 'most-liked' | 'need-discussion' | 'none';

export const ideaRepository = {
  async findByIssueId(issueId: string) {
    return prisma.idea.findMany({
      where: {
        issueId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            title: true,
          },
        },
        votes: {
          where: { deletedAt: null },
        },
        comments: {
          where: { deletedAt: null },
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async resetCategoriesByIssueId(
    issueId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.idea.updateMany({
      where: { issueId },
      data: { categoryId: null, positionX: null, positionY: null },
    });
  },

  async create(data: {
    issueId: string;
    userId: string;
    content: string;
    positionX?: number;
    positionY?: number;
    categoryId?: string;
  }) {
    return prisma.idea.create({
      data: {
        issueId: data.issueId,
        userId: data.userId,
        content: data.content,
        positionX: data.positionX,
        positionY: data.positionY,
        categoryId: data.categoryId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  },

  async softDelete(ideaId: string) {
    return prisma.idea.update({
      where: { id: ideaId },
      data: { deletedAt: new Date() },
    });
  },

  async update(ideaId: string, data: {
    positionX?: number;
    positionY?: number;
    categoryId?: string;
  }) {
    const { positionX, positionY, categoryId } = data;
    return prisma.idea.update({
      where: { id: ideaId },
      data: {
        positionX,
        positionY,
        categoryId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  },

  async findFilteredIdeaIds(
    issueId: string,
    filter: IdeaFilterType,
    tx: Prisma.TransactionClient = prisma,
  ) {
    // 1. 필터가 없으면 즉시 빈 배열 반환
    if (filter === 'none') return [];

    // 2. 해당 이슈에 속한 모든 아이디어 ID 목록을 조회
    const ideas = await tx.idea.findMany({
      where: { issueId, deletedAt: null },
      select: { id: true },
    });

    if (ideas.length === 0) return [];

    const ideaIds = ideas.map((idea) => idea.id);

    // 3. [DB 집계] 아이디어별로 찬성(AGREE)/반대(DISAGREE) 투표 수를 그룹화하여 조회
    const voteRows = await tx.vote.groupBy({
      by: ['ideaId', 'type'],
      where: { ideaId: { in: ideaIds }, deletedAt: null },
      _count: { _all: true },
    });

    // 4. [데이터 매핑] 조회된 데이터를 아이디어 ID를 키로 하는 Map 구조로 변환 (접근 속도 최적화)
    const countsByIdeaId = new Map<string, { agree: number; disagree: number }>();
    for (const ideaId of ideaIds) {
      countsByIdeaId.set(ideaId, { agree: 0, disagree: 0 });
    }

    for (const row of voteRows) {
      const counts = countsByIdeaId.get(row.ideaId);
      if (!counts) continue;
      if (row.type === VoteType.AGREE) {
        counts.agree = row._count._all;
        continue;
      }
      if (row.type === VoteType.DISAGREE) {
        counts.disagree = row._count._all;
      }
    }

    // 5. [통계 수치 계산] 정렬 및 필터링에 필요한 점수(차이, 비율 등)를 미리 계산
    const ideaStats = ideaIds.map((id) => {
      const counts = countsByIdeaId.get(id) ?? { agree: 0, disagree: 0 };
      const total = counts.agree + counts.disagree;
      const diff = Math.abs(counts.agree - counts.disagree); // 찬반 차이 절대값
      const signedDiff = counts.agree - counts.disagree;    // 찬성 - 반대

      return {
        id,
        agree: counts.agree,
        disagree: counts.disagree,
        total,
        diff,
        signedDiff,
      };
    });

    let sorted = [...ideaStats];

    // 6-1. [필터: 찬성 많은 순] 찬성-반대 수치가 높은 순으로 정렬 (동점 시 찬성 수 기준)
    if (filter === 'most-liked') {
      sorted.sort((a, b) => {
        if (a.signedDiff === b.signedDiff) return b.agree - a.agree;
        return b.signedDiff - a.signedDiff;
      });
    } 
    // 6-2. [필터: 논의 필요] 찬반 비율 차이가 20% 이내인 아이디어만 추출 후 찬성순 정렬
    else if (filter === 'need-discussion') {
      sorted = sorted
        .filter((idea) => idea.total > 0 && idea.diff / idea.total <= 0.2)
        .sort((a, b) => b.agree - a.agree);
    }

    if (sorted.length === 0) return [];

    // 7. [공동 순위 처리] 상위 3등 이내에 포함되거나, 3등과 수치가 동일한 아이디어를 추출
    const limit = Math.min(sorted.length, 3);
    const thirdStandard = sorted[limit - 1]; // 3등(또는 마지막 원소)의 기준 데이터
    const thirdAgree = thirdStandard.agree;
    const thirdDiff = thirdStandard.agree - thirdStandard.disagree;

    const result = sorted.filter((idea, index) => {
      // 투표가 아예 없는 경우는 제외
      if (idea.total === 0) return false;
      
      // 상위 1~3위는 무조건 포함
      if (index < 3) return true;

      // "논의 필요" 필터일 때: 3등과 찬성 수가 같으면 공동 순위로 포함
      if (filter === 'need-discussion') {
        return idea.agree === thirdAgree;
      }

      // "찬성 많은 순" 필터일 때: 3등과 찬성 수가 같으면서 [찬성-반대] 점수도 기준 이상이어야 함
      const ideaDiff = idea.agree - idea.disagree;
      return idea.agree === thirdAgree && ideaDiff >= thirdDiff;
    });

    // 8. 최종 결과로 아이디어 ID 배열만 추출하여 반환
    return result.map((idea) => idea.id);
  }
}
