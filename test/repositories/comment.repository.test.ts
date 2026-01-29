import { prisma } from '@/lib/prisma';
import { commentRepository } from '@/lib/repositories/comment.repository';

// Prisma 클라이언트 모킹
jest.mock('@/lib/prisma', () => ({
  prisma: {
    comment: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    issueMember: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

const mockedPrismaComment = prisma.comment as jest.Mocked<typeof prisma.comment>;
const mockedPrismaIssueMember = prisma.issueMember as jest.Mocked<typeof prisma.issueMember>;

/**
 * 댓글 리포지토리 테스트
 */
describe('Comment Repository 테스트', () => {
  // 테스트용 공통 데이터 정의
  const ideaId = 'idea-123';
  const commentId = 'comment-1';
  const userId = 'user-123';
  const content = '테스트 댓글 내용';
  const mockDate = new Date();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByIdeaId (댓글 목록 조회)', () => {
    it('삭제되지 않은 댓글을 생성일 기준 오름차순으로 반환해야 한다', async () => {
      // Given
      const issueId = 'issue-123';
      const mockComments = [
        { id: 'comment-1', content: '첫 번째 댓글', createdAt: mockDate, userId: 'user-1', user: { id: 'user-1', name: 'User 1' } },
        { id: 'comment-2', content: '두 번째 댓글', createdAt: mockDate, userId: 'user-2', user: { id: 'user-2', name: 'User 2' } },
      ];
      const mockIssueMembers = [
        { userId: 'user-1', nickname: 'Nickname 1' },
        { userId: 'user-2', nickname: 'Nickname 2' },
      ];
      mockedPrismaComment.findMany.mockResolvedValue(mockComments as any);
      mockedPrismaIssueMember.findMany.mockResolvedValue(mockIssueMembers as any);

      // When
      const result = await commentRepository.findByIdeaId(ideaId, issueId);

      // Then
      expect(mockedPrismaComment.findMany).toHaveBeenCalledWith({
        where: {
          ideaId,
          deletedAt: null, // Soft Delete 필터링 확인
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
      expect(mockedPrismaIssueMember.findMany).toHaveBeenCalledWith({
        where: {
          issueId,
          deletedAt: null,
        },
        select: {
          userId: true,
          nickname: true,
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0].user.nickname).toBe('Nickname 1');
      expect(result[1].user.nickname).toBe('Nickname 2');
    });
  });

  describe('create (댓글 생성)', () => {
    it('새로운 댓글을 생성하고 지정된 필드를 반환해야 한다', async () => {
      // Given
      const issueId = 'issue-123';
      const input = { ideaId, userId, content, issueId };
      const mockCreatedComment = { id: commentId, content, createdAt: mockDate, userId, user: { id: userId, name: 'User 1' } };
      const mockIssueMember = { nickname: 'Nickname 1' };
      mockedPrismaComment.create.mockResolvedValue(mockCreatedComment as any);
      mockedPrismaIssueMember.findFirst.mockResolvedValue(mockIssueMember as any);

      // When
      const result = await commentRepository.create(input);

      // Then
      expect(mockedPrismaComment.create).toHaveBeenCalledWith({
        data: {
          ideaId: input.ideaId,
          userId: input.userId,
          content: input.content,
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
      expect(mockedPrismaIssueMember.findFirst).toHaveBeenCalledWith({
        where: {
          issueId,
          userId,
          deletedAt: null,
        },
        select: {
          nickname: true,
        },
      });
      expect(result).toEqual({
        id: commentId,
        content,
        createdAt: mockDate,
        user: {
          id: userId,
          name: 'User 1',
          nickname: 'Nickname 1',
        },
      });
    });
  });

  describe('update (댓글 수정)', () => {
    it('댓글 내용을 수정하고 업데이트된 필드를 반환해야 한다', async () => {
      // Given
      const updatedContent = '수정된 댓글 내용';
      const mockUpdatedComment = { id: commentId, content: updatedContent, createdAt: mockDate };
      mockedPrismaComment.update.mockResolvedValue(mockUpdatedComment as any);

      // When
      const result = await commentRepository.update(commentId, updatedContent);

      // Then
      expect(mockedPrismaComment.update).toHaveBeenCalledWith({
        where: { id: commentId },
        data: { content: updatedContent },
        select: {
          id: true,
          content: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockUpdatedComment);
    });
  });

  describe('softDelete (댓글 논리 삭제)', () => {
    it('댓글의 deletedAt 필드에 현재 시간을 기록해야 한다', async () => {
      // Given
      mockedPrismaComment.update.mockResolvedValue({ id: commentId } as any);

      // When
      await commentRepository.softDelete(commentId);

      // Then
      const updateCall = mockedPrismaComment.update.mock.calls[0][0];
      expect(updateCall.where).toEqual({ id: commentId });
      expect(updateCall.data.deletedAt).toBeInstanceOf(Date); // 날짜 객체가 전달되었는지 확인
    });
  });
});
