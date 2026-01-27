import { findReportWithDetailsById } from '@/lib/repositories/report.repository';
import { getReportSummaryByIssueId } from '@/lib/services/report.service';
import { ReportWithDetails } from '@/types/report';

jest.mock('@/lib/repositories/report.repository');

const mockedFindReportWithDetailsById = findReportWithDetailsById as jest.MockedFunction<
  typeof findReportWithDetailsById
>;

// 테스트 데이터 생성 헬퍼 함수
const createMockReportBase = (
  issueId: string,
): Omit<ReportWithDetails, 'issue' | 'selectedIdea'> => ({
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
    image?: string | null;
  } = {},
) => ({
  id,
  name,
  displayName: options.displayName ?? name,
  image: options.image ?? null,
});

const createMockIdea = (
  id: string,
  content: string,
  options: {
    agreeCount?: number;
    disagreeCount?: number;
    comments?: number;
    category?: { id: string; title: string } | null;
    user?: ReturnType<typeof createMockUser>;
  } = {},
) => {
  const {
    agreeCount = 0,
    disagreeCount = 0,
    comments = 0,
    category = null,
    user = createMockUser('user-1', 'User 1'),
  } = options;

  return {
    id,
    content,
    agreeCount,
    disagreeCount,
    comments: Array.from({ length: comments }, (_, i) => ({
      id: `comment-${id}-${i}`,
      content: `Comment content ${i}`,
    })),
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
        agreeCount: 2,
        disagreeCount: 1,
        comments: 2,
        category: category1,
        user: createMockUser('user-1', 'John Doe', {
          displayName: 'John',
          image: 'https://example.com/avatar.jpg',
        }),
      });
      const idea2 = createMockIdea('idea-2', 'Second idea', {
        agreeCount: 1,
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
          agreeCount: idea1.agreeCount,
          disagreeCount: idea1.disagreeCount,
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
      expect(result?.rankings.all[0].agreeCount).toBe(2);
      expect(result?.rankings.all[0].disagreeCount).toBe(1);
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
              agreeCount: 1,
              category: cat1,
              user: createMockUser('user-1', 'User 1'),
            }),
            createMockIdea('idea-2', 'Category 2 idea', {
              agreeCount: 1,
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

    it('아이디어 랭킹을 정렬 규칙(1.차이 -> 2.합계)에 따라 정렬한다', async () => {
      // 준비
      const mockReport: ReportWithDetails = {
        ...createMockReportBase(mockIssueId),
        issue: createMockIssue(mockIssueId, {
          ideas: [
            // Idea A: 차이 2 (3-1), 합계 4, 찬성 3 => 3등
            createMockIdea('idea-A', 'Score 2, Total 4', {
              agreeCount: 3,
              disagreeCount: 1,
            }),
            // Idea B: 차이 2 (4-2), 합계 6, 찬성 4 => 1등 (합계가 높음)
            createMockIdea('idea-B', 'Score 2, Total 6', {
              agreeCount: 4,
              disagreeCount: 2,
            }),
            // Idea C: 차이 2 (3-1), 합계 4, 찬성 3 => Idea A와 동점 (공동 3등)
            // 테스트를 위해 A와 완벽히 같은 조건
            createMockIdea('idea-C', 'Score 2, Total 4', {
              agreeCount: 3,
              disagreeCount: 1,
            }),
            // Idea D: 차이 3 (3-0) => 0순위 (점수 자체가 높음) -> 실제 1등
            createMockIdea('idea-D', 'Score 3', {
              agreeCount: 3,
              disagreeCount: 0,
            }),
          ],
        }),
        selectedIdea: null,
      };

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport);

      // 실행
      const result = await getReportSummaryByIssueId(mockIssueId);
      const rankings = result?.rankings.all || [];

      // 검증
      expect(rankings).toHaveLength(4);

      // 1위: Idea D (점수 차이 3점으로 가장 높음)
      expect(rankings[0].id).toBe('idea-D');

      // 2위: Idea B (점수 차이는 2점으로 A,C와 같으나, 투표 합계가 6으로 가장 많음)
      expect(rankings[1].id).toBe('idea-B');

      // 3, 4위: Idea A와 Idea C (모든 조건이 같음, 순서는 인덱스나 생성 순서에 따름)
      // A와 C가 3번째, 4번째에 위치하는지만 확인
      const lastTwoIds = [rankings[2].id, rankings[3].id];
      expect(lastTwoIds).toContain('idea-A');
      expect(lastTwoIds).toContain('idea-C');
    });

    // 동점자 등수 처리(Rank) 로직 검증
    it('동점자에게는 같은 등수를 부여하고, 다음 등수는 건너뛴다 (1224 방식)', async () => {
      // 준비
      const mockReport: ReportWithDetails = {
        ...createMockReportBase(mockIssueId),
        issue: createMockIssue(mockIssueId, {
          ideas: [
            // 공동 1등 (10 - 0 = 10점)
            createMockIdea('idea-1', 'Winner 1', { agreeCount: 10, disagreeCount: 0 }),
            // 공동 1등 (10 - 0 = 10점)
            createMockIdea('idea-2', 'Winner 2', { agreeCount: 10, disagreeCount: 0 }),
            // 3등 (5 - 0 = 5점) -> 2등이 아니라 3등이어야 함
            createMockIdea('idea-3', 'Second Place', { agreeCount: 5, disagreeCount: 0 }),
          ],
        }),
        selectedIdea: null,
      };

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport);

      // 실행
      const result = await getReportSummaryByIssueId(mockIssueId);
      const rankings = result?.rankings.all;

      // 검증
      expect(rankings).toBeDefined();
      if (!rankings) return;

      // 등수 확인
      expect(rankings[0].rank).toBe(1); // 첫 번째 사람 1등
      expect(rankings[1].rank).toBe(1); // 두 번째 사람도 1등 (동점)
      expect(rankings[2].rank).toBe(3); // 세 번째 사람은 3등 (2등 건너뜀)
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
