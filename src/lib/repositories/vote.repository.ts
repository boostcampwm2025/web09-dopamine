import { prisma } from '@/lib/prisma';
import { Prisma, VoteType } from '@prisma/client';

export const voteRepository = {
  /**
   * 사용자가 특정 아이디어에 남긴 '활성화된(삭제되지 않은)' 투표가 있는지 조회
   * @param tx - 트랜잭션 객체 (기본값은 일반 prisma 클라이언트)
   */
  async findActiveVote(
    ideaId: string,
    userId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.vote.findFirst({
      where: {
        ideaId,
        userId,
        deletedAt: null, // 삭제되지 않은 투표만 조회 (Soft Delete 대응)
      },
    });
  },

  /**
   * 사용자의 투표 상태를 설정 (생성, 수정, 삭제 일괄 처리)
   * @param type - AGREE, DISAGREE 또는 null(취소)
   * @returns 최종적으로 결정된 투표 타입 (취소된 경우 null)
   */
  async setVote(
    ideaId: string,
    userId: string,
    type: VoteType | null,
    tx: Prisma.TransactionClient = prisma,
  ) {
    // 1. 기존에 해당 사용자가 한 투표가 있는지 확인
    const existing = await this.findActiveVote(ideaId, userId, tx);

    // [상태: 취소 요청] 사용자가 투표를 취소(null)하고자 할 때
    if (!type) {
      if (!existing) return null; // 기존 투표가 없으면 아무것도 안 함
      await tx.vote.update({
        where: { id: existing.id },
        data: { deletedAt: new Date() }, // 실제 삭제 대신 삭제 일시 기록 (Soft Delete)
      });
      return null;
    }

    // [상태: 신규 투표] 기존 투표가 없는 상태에서 새로 찬성/반대를 할 때
    if (!existing) {
      const created = await tx.vote.create({
        data: { ideaId, userId, type },
      });
      return created.type;
    }

    // [상태: 토글 취소] 기존 투표 타입과 새로운 타입이 같으면 투표를 철회(취소)함
    // 예: 찬성인 상태에서 다시 찬성을 누르면 투표 취소
    if (existing.type === type) {
      await tx.vote.update({
        where: { id: existing.id },
        data: { deletedAt: new Date() },
      });
      return null;
    }

    // [상태: 타입 변경] 기존 투표와 다른 타입으로 변경할 때 (찬성 -> 반대 등)
    const updated = await tx.vote.update({
      where: { id: existing.id },
      data: { type },
    });

    return updated.type;
  },

  /**
   * 특정 아이디어의 전체 찬성/반대 수 집계
   * SQL의 GROUP BY와 유사한 방식으로 동작
   */
  async countByIdeaId(ideaId: string, tx: Prisma.TransactionClient = prisma) {
    // DB에서 타입별(AGREE/DISAGREE)로 그룹화하여 개수를 세어옴
    const rows = await tx.vote.groupBy({
      by: ['type'],
      where: { ideaId, deletedAt: null }, // 유효한 투표만 집계
      _count: { _all: true },
    });

    let agreeCount = 0;
    let disagreeCount = 0;

    // 집계된 로우들을 순회하며 결과 객체에 할당
    for (const row of rows) {
      if (row.type === VoteType.AGREE) {
        agreeCount = row._count._all;
        continue;
      }
      if (row.type === VoteType.DISAGREE) {
        disagreeCount = row._count._all;
      }
    }

    return { agreeCount, disagreeCount };
  },
};