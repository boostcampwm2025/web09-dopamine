import { prisma } from '@/lib/prisma';

/**
 * 댓글 데이터 관리를 위한 리포지토리 객체
 */
export const commentRepository = {
  /**
   * 특정 아이디어에 속한 삭제되지 않은 모든 댓글을 조회합니다.
   * @param ideaId - 조회할 아이디어의 ID
   * @param issueId - 이슈 ID (IssueMember nickname 조회용)
   * @returns 생성일 기준 오름차순으로 정렬된 댓글 목록
   */
  async findByIdeaId(ideaId: string, issueId: string) {
    const comments = await prisma.comment.findMany({
      where: {
        ideaId,
        deletedAt: null, // 삭제되지 않은 댓글만 조회 (Soft Delete 필터링)
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // IssueMember 정보 가져오기
    const issueMembers = await prisma.issueMember.findMany({
      where: {
        issueId,
        deletedAt: null,
      },
      select: {
        userId: true,
        nickname: true,
      },
    });

    const memberMap = new Map(issueMembers.map((m) => [m.userId, m.nickname]));

    // 각 댓글에 IssueMember nickname 추가
    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: comment.user
        ? {
            id: comment.user.id,
            name: comment.user.name,
            nickname: comment.userId ? memberMap.get(comment.userId) ?? null : null,
          }
        : null,
    }));
  },

  /**
   * 새로운 댓글을 생성합니다.
   * @param data - 아이디어 ID, 유저 ID, 댓글 내용, 이슈 ID를 포함하는 데이터 객체
   * @returns 생성된 댓글의 주요 정보 (ID, 내용, 생성일)
   */
  async create(data: { ideaId: string; userId: string; content: string; issueId: string }) {
    const comment = await prisma.comment.create({
      data: {
        ideaId: data.ideaId,
        userId: data.userId,
        content: data.content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // IssueMember nickname 가져오기
    const issueMember = await prisma.issueMember.findFirst({
      where: {
        issueId: data.issueId,
        userId: data.userId,
        deletedAt: null,
      },
      select: {
        nickname: true,
      },
    });

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: comment.user
        ? {
            id: comment.user.id,
            name: comment.user.name,
            nickname: issueMember?.nickname || null,
          }
        : null,
    };
  },

  /**
   * 기존 댓글의 내용을 수정합니다.
   * @param commentId - 수정할 댓글의 식별자
   * @param content - 수정될 새로운 댓글 내용
   * @returns 수정이 완료된 댓글 정보
   */
  async update(commentId: string, content: string) {
    return prisma.comment.update({
      where: { id: commentId },
      data: { content },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });
  },

  /**
   * 댓글을 논리 삭제(Soft Delete) 처리합니다.
   * 실제 데이터를 삭제하지 않고 삭제 일시를 기록합니다.
   * @param commentId - 삭제 처리할 댓글의 식별자
   * @returns 업데이트된 댓글 객체
   */
  async softDelete(commentId: string) {
    return prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  },

  /**
   * 특정 아이디어의 댓글 개수를 조회합니다.
   * @param ideaId - 아이디어 식별자
   * @returns 댓글 개수
   */
  async countByIdeaId(ideaId: string) {
    return prisma.comment.count({
      where: {
        ideaId,
        deletedAt: null,
      },
    });
  },
};
