import { getReportSummaryByIssueId } from '@/lib/services/report.service';
import { findReportWithDetailsById } from '@/lib/repositories/report.repository';
import { ReportWithDetails } from '@/types/report';

jest.mock('@/lib/repositories/report.repository');

const mockedFindReportWithDetailsById = findReportWithDetailsById as jest.MockedFunction<
  typeof findReportWithDetailsById
>;

// 테스트 데이터 생성 헬퍼 함수
const createMockReportBase = (issueId: string): Omit<ReportWithDetails, 'issue' | 'selectedIdea'> => ({
  id: 'report-123',
  issueId,
  selectedIdeaId: null,
  memo: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

const createMockUser = (
  id: string,
  name: string,
  options: {
    displayName?: string | null;
    avatarUrl?: string | null;
  } = {},
) => ({
  id,
  name,
  displayName: options.displayName ?? name,
  avatarUrl: options.avatarUrl ?? null,
});

const createMockIdea = (
  id: string,
  content: string,
  options: {
    agreeVotes?: number;
    disagreeVotes?: number;
    comments?: number;
    category?: { id: string; title: string } | null;
    user?: ReturnType<typeof createMockUser>;
  } = {},
) => {
  const {
    agreeVotes = 0,
    disagreeVotes = 0,
    comments = 0,
    category = null,
    user = createMockUser('user-1', 'User 1'),
  } = options;

  return {
    id,
    content,
    votes: [
      ...Array.from({ length: agreeVotes }, (_, i) => ({
        id: `vote-${id}-agree-${i}`,
        type: 'AGREE' as const,
      })),
      ...Array.from({ length: disagreeVotes }, (_, i) => ({
        id: `vote-${id}-disagree-${i}`,
        type: 'DISAGREE' as const,
      })),
    ],
    comments: Array.from({ length: comments }, (_, i) => ({ id: `comment-${id}-${i}` })),
    category,
    user,
  };
};

const createMockIssue = (
  issueId: string,
  options: {
    members?: number;
    ideas?: ReturnType<typeof createMockIdea>[];
  } = {},
) => {
  const { members = 0, ideas = [] } = options;

  return {
    id: issueId,
    title: 'Test Issue',
    issueMembers: Array.from({ length: members }, (_, i) => ({
      id: `member-${i}`,
      userId: `user-${i}`,
      deletedAt: null,
    })),
    ideas,
  };
};

describe('Report Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getReportSummaryByIssueId', () => {
    const mockIssueId = 'issue-123';

    it('리포트가 존재하지 않으면 null을 반환한다', async () => {
      // 준비
      mockedFindReportWithDetailsById.mockResolvedValue(null);

      // 실행
      const result = await getReportSummaryByIssueId(mockIssueId);

      // 검증
      expect(mockedFindReportWithDetailsById).toHaveBeenCalledWith(mockIssueId);
      expect(result).toBeNull();
    });

    it('리포트 데이터를 올바르게 변환하여 반환한다', async () => {
      // 준비
      const category1 = { id: 'cat-1', title: 'Category 1' };
      const idea1 = createMockIdea('idea-1', 'First idea', {
        agreeVotes: 2,
        disagreeVotes: 1,
        comments: 2,
        category: category1,
        user: createMockUser('user-1', 'John Doe', {
          displayName: 'John',
          avatarUrl: 'https://example.com/avatar.jpg',
        }),
      });
      const idea2 = createMockIdea('idea-2', 'Second idea', {
        agreeVotes: 1,
        comments: 1,
        category: category1,
        user: createMockUser('user-2', 'Jane Doe'),
      });

      const mockReport: ReportWithDetails = {
        ...createMockReportBase(mockIssueId),
        selectedIdeaId: 'idea-1',
        memo: 'Test memo',
        issue: createMockIssue(mockIssueId, {
          members: 2,
          ideas: [idea1, idea2],
        }),
        selectedIdea: {
          id: idea1.id,
          content: idea1.content,
          votes: idea1.votes,
          comments: idea1.comments,
          category: idea1.category,
        },
      };

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport);

      // 실행
      const result = await getReportSummaryByIssueId(mockIssueId);

      // 검증
      expect(result).not.toBeNull();
      expect(result?.id).toBe('report-123');
      expect(result?.memo).toBe('Test memo');

      // selectedIdea 검증
      expect(result?.selectedIdea).toEqual({
        id: 'idea-1',
        content: 'First idea',
        voteCount: 3,
        commentCount: 2,
        category: { id: 'cat-1', title: 'Category 1' },
      });

      // statistics 검증
      expect(result?.statistics).toEqual({
        totalParticipants: 2,
        totalVotes: 4,
        maxCommentCount: 2,
      });

      // rankings.all 검증 (투표 점수 순으로 정렬)
      expect(result?.rankings.all).toHaveLength(2);
      expect(result?.rankings.all[0].id).toBe('idea-1'); // 2 agree - 1 disagree = 1점
      expect(result?.rankings.all[0].agreeVoteCount).toBe(2);
      expect(result?.rankings.all[0].disagreeVoteCount).toBe(1);
      expect(result?.rankings.all[1].id).toBe('idea-2'); // 1 agree - 0 disagree = 1점
    });

    it('카테고리별로 아이디어를 그룹핑하여 반환한다', async () => {
      // 준비
      const cat1 = { id: 'cat-1', title: 'Category 1' };
      const cat2 = { id: 'cat-2', title: 'Category 2' };

      const mockReport: ReportWithDetails = {
        ...createMockReportBase(mockIssueId),
        issue: createMockIssue(mockIssueId, {
          members: 1,
          ideas: [
            createMockIdea('idea-1', 'Category 1 idea', {
              agreeVotes: 1,
              category: cat1,
              user: createMockUser('user-1', 'User 1'),
            }),
            createMockIdea('idea-2', 'Category 2 idea', {
              agreeVotes: 1,
              category: cat2,
              user: createMockUser('user-2', 'User 2'),
            }),
            createMockIdea('idea-3', 'Another Category 1 idea', {
              category: cat1,
              user: createMockUser('user-3', 'User 3'),
            }),
          ],
        }),
        selectedIdea: null,
      };

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport);

      // 실행
      const result = await getReportSummaryByIssueId(mockIssueId);

      // 검증
      expect(result?.rankings.byCategory).toHaveLength(2);

      // Category 1 검증
      const foundCat1 = result?.rankings.byCategory.find((cat) => cat.categoryId === 'cat-1');
      expect(foundCat1).toBeDefined();
      expect(foundCat1?.categoryTitle).toBe('Category 1');
      expect(foundCat1?.ideas).toHaveLength(2);

      // Category 2 검증
      const foundCat2 = result?.rankings.byCategory.find((cat) => cat.categoryId === 'cat-2');
      expect(foundCat2).toBeDefined();
      expect(foundCat2?.categoryTitle).toBe('Category 2');
      expect(foundCat2?.ideas).toHaveLength(1);
    });

    it('카테고리가 없는 아이디어는 "미분류"로 그룹핑한다', async () => {
      // 준비
      const mockReport: ReportWithDetails = {
        ...createMockReportBase(mockIssueId),
        issue: createMockIssue(mockIssueId, {
          members: 1,
          ideas: [
            createMockIdea('idea-1', 'Uncategorized idea', {
              user: createMockUser('user-1', 'User 1'),
            }),
          ],
        }),
        selectedIdea: null,
      };

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport);

      // 실행
      const result = await getReportSummaryByIssueId(mockIssueId);

      // 검증
      expect(result?.rankings.byCategory).toHaveLength(1);
      expect(result?.rankings.byCategory[0].categoryId).toBe('uncategorized');
      expect(result?.rankings.byCategory[0].categoryTitle).toBe('미분류');
      expect(result?.rankings.byCategory[0].ideas[0].category).toBeNull();
    });

    it('아이디어가 없는 경우에도 올바르게 처리한다', async () => {
      // 준비
      const mockReport: ReportWithDetails = {
        ...createMockReportBase(mockIssueId),
        issue: createMockIssue(mockIssueId, {
          members: 1,
          ideas: [],
        }),
        selectedIdea: null,
      };

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport);

      // 실행
      const result = await getReportSummaryByIssueId(mockIssueId);

      // 검증
      expect(result?.statistics).toEqual({
        totalParticipants: 1,
        totalVotes: 0,
        maxCommentCount: 0,
      });
      expect(result?.rankings.all).toHaveLength(0);
      expect(result?.rankings.byCategory).toHaveLength(0);
    });

    it('아이디어 랭킹을 투표 점수(찬성 - 반대) 순으로 정렬한다', async () => {
      // 준비
      const mockReport: ReportWithDetails = {
        ...createMockReportBase(mockIssueId),
        issue: createMockIssue(mockIssueId, {
          ideas: [
            createMockIdea('idea-1', 'Low score idea', {
              disagreeVotes: 1,
              user: createMockUser('user-1', 'User 1'),
            }),
            createMockIdea('idea-2', 'High score idea', {
              agreeVotes: 3,
              user: createMockUser('user-2', 'User 2'),
            }),
            createMockIdea('idea-3', 'Medium score idea', {
              agreeVotes: 1,
              user: createMockUser('user-3', 'User 3'),
            }),
          ],
        }),
        selectedIdea: null,
      };

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport);

      // 실행
      const result = await getReportSummaryByIssueId(mockIssueId);

      // 검증
      expect(result?.rankings.all).toHaveLength(3);
      expect(result?.rankings.all[0].id).toBe('idea-2'); // 3 - 0 = 3점
      expect(result?.rankings.all[0].agreeVoteCount).toBe(3);
      expect(result?.rankings.all[0].disagreeVoteCount).toBe(0);
      expect(result?.rankings.all[1].id).toBe('idea-3'); // 1 - 0 = 1점
      expect(result?.rankings.all[2].id).toBe('idea-1'); // 0 - 1 = -1점
    });

    it('선택된 아이디어가 없는 경우 null을 반환한다', async () => {
      // 준비
      const mockReport: ReportWithDetails = {
        ...createMockReportBase(mockIssueId),
        issue: createMockIssue(mockIssueId, {
          ideas: [],
        }),
        selectedIdea: null,
      };

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport);

      // 실행
      const result = await getReportSummaryByIssueId(mockIssueId);

      // 검증
      expect(result?.selectedIdea).toBeNull();
    });

    it('댓글 수가 가장 많은 아이디어의 댓글 수를 maxCommentCount로 반환한다', async () => {
      // 준비
      const mockReport: ReportWithDetails = {
        ...createMockReportBase(mockIssueId),
        issue: createMockIssue(mockIssueId, {
          ideas: [
            createMockIdea('idea-1', 'Idea with 2 comments', {
              comments: 2,
              user: createMockUser('user-1', 'User 1'),
            }),
            createMockIdea('idea-2', 'Idea with 5 comments', {
              comments: 5,
              user: createMockUser('user-2', 'User 2'),
            }),
            createMockIdea('idea-3', 'Idea with 1 comment', {
              comments: 1,
              user: createMockUser('user-3', 'User 3'),
            }),
          ],
        }),
        selectedIdea: null,
      };

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport);

      // 실행
      const result = await getReportSummaryByIssueId(mockIssueId);

      // 검증
      expect(result?.statistics.maxCommentCount).toBe(5);
    });
  });
});
