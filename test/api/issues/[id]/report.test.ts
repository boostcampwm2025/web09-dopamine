import { NextRequest } from 'next/server';
import { GET } from '@/app/api/issues/[id]/report/route';
import { findReportWithDetailsById } from '@/lib/repositories/report.repository';
import { ReportWithDetails } from '@/types/report';

// 레파지토리 모킹
jest.mock('@/lib/repositories/report.repository');

const mockedFindReportWithDetailsById = findReportWithDetailsById as jest.MockedFunction<
  typeof findReportWithDetailsById
>;

describe('GET /api/issues/[id]/report', () => {
  const mockIssueId = 'test-issue-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = () => {
    return {} as unknown as NextRequest;
  };

  const createMockParams = (id: string) => {
    return {
      params: { id },
    };
  };

  const createMockReportData = () =>
    ({
      id: 'report-123',
      issueId: mockIssueId,
      selectedIdeaId: 'idea-1',
      memo: 'Test memo',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      issue: {
        id: mockIssueId,
        title: 'Test Issue',
        issueMembers: [
          { id: 'member-1', userId: 'user-1', deletedAt: null },
          { id: 'member-2', userId: 'user-2', deletedAt: null },
        ],
        ideas: [
          {
            id: 'idea-1',
            content: 'First idea',
            votes: [{ id: 'vote-1' }, { id: 'vote-2' }, { id: 'vote-3' }],
            comments: [{ id: 'comment-1' }, { id: 'comment-2' }],
            category: { id: 'cat-1', title: 'Category A' },
            user: {
              id: 'user-1',
              name: 'User 1',
              displayName: 'User One',
              avatarUrl: null,
            },
          },
          {
            id: 'idea-2',
            content: 'Second idea',
            votes: [{ id: 'vote-4' }, { id: 'vote-5' }],
            comments: [{ id: 'comment-3' }],
            category: { id: 'cat-1', title: 'Category A' },
            user: {
              id: 'user-2',
              name: 'User 2',
              displayName: 'User Two',
              avatarUrl: null,
            },
          },
          {
            id: 'idea-3',
            content: 'Third idea',
            votes: [{ id: 'vote-6' }],
            comments: [],
            category: { id: 'cat-2', title: 'Category B' },
            user: {
              id: 'user-1',
              name: 'User 1',
              displayName: 'User One',
              avatarUrl: null,
            },
          },
        ],
      },
      selectedIdea: {
        id: 'idea-1',
        content: 'First idea',
        votes: [{ id: 'vote-1' }, { id: 'vote-2' }, { id: 'vote-3' }],
        comments: [{ id: 'comment-1' }, { id: 'comment-2' }],
        category: { id: 'cat-1', title: 'Category A' },
      },
      wordClouds: [
        { id: 'wc-1', word: 'innovation', count: 10 },
        { id: 'wc-2', word: 'solution', count: 8 },
      ],
    }) as ReportWithDetails;

  describe('정상 조회', () => {
    it('리포트 데이터를 정상적으로 반환한다', async () => {
      const req = createMockRequest();
      const params = createMockParams(mockIssueId);
      const mockReport = createMockReportData();

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport as any);

      const response = await GET(req, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('report-123');
      expect(data.memo).toBe('Test memo');
      expect(mockedFindReportWithDetailsById).toHaveBeenCalledWith(mockIssueId);
    });

    it('선택된 아이디어 정보를 올바르게 반환한다', async () => {
      const req = createMockRequest();
      const params = createMockParams(mockIssueId);
      const mockReport = createMockReportData();

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport as any);

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.selectedIdea).toBeDefined();
      expect(data.selectedIdea.id).toBe('idea-1');
      expect(data.selectedIdea.content).toBe('First idea');
      expect(data.selectedIdea.voteCount).toBe(3);
      expect(data.selectedIdea.commentCount).toBe(2);
    });

    it('투표 통계를 올바르게 계산한다', async () => {
      const req = createMockRequest();
      const params = createMockParams(mockIssueId);
      const mockReport = createMockReportData();

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport as any);

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.statistics.totalParticipants).toBe(2);
      expect(data.statistics.totalVotes).toBe(6);
      expect(data.statistics.maxCommentCount).toBe(2);
    });

    it('전체 랭킹을 투표 수 기준으로 정렬하여 반환한다', async () => {
      const req = createMockRequest();
      const params = createMockParams(mockIssueId);
      const mockReport = createMockReportData();

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport as any);

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.rankings.all).toHaveLength(3);
      expect(data.rankings.all[0].id).toBe('idea-1');
      expect(data.rankings.all[0].voteCount).toBe(3);
      expect(data.rankings.all[1].id).toBe('idea-2');
      expect(data.rankings.all[1].voteCount).toBe(2);
      expect(data.rankings.all[2].id).toBe('idea-3');
      expect(data.rankings.all[2].voteCount).toBe(1);
    });

    it('카테고리별 랭킹을 올바르게 그룹화하고 정렬한다', async () => {
      const req = createMockRequest();
      const params = createMockParams(mockIssueId);
      const mockReport = createMockReportData();

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport as any);

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.rankings.byCategory['Category A']).toHaveLength(2);
      expect(data.rankings.byCategory['Category A'][0].id).toBe('idea-1');
      expect(data.rankings.byCategory['Category A'][1].id).toBe('idea-2');
      expect(data.rankings.byCategory['Category B']).toHaveLength(1);
      expect(data.rankings.byCategory['Category B'][0].id).toBe('idea-3');
    });
  });

  describe('선택된 아이디어가 없는 경우', () => {
    it('selectedIdea가 null일 때도 정상 처리한다', async () => {
      const req = createMockRequest();
      const params = createMockParams(mockIssueId);
      const mockReport = createMockReportData();
      mockReport.selectedIdea = null as any;
      mockReport.selectedIdeaId = null;

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport as any);

      const response = await GET(req, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.selectedIdea).toBeNull();
    });
  });

  describe('에러 처리', () => {
    it('리포트를 찾을 수 없을 때 404 에러를 반환한다', async () => {
      const req = createMockRequest();
      const params = createMockParams(mockIssueId);

      mockedFindReportWithDetailsById.mockResolvedValue(null);

      const response = await GET(req, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Report not found');
    });

    it('예상치 못한 에러 발생 시 500 에러를 반환한다', async () => {
      const req = createMockRequest();
      const params = createMockParams(mockIssueId);

      mockedFindReportWithDetailsById.mockRejectedValue(new Error('Database error'));

      const response = await GET(req, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('리포트를 가져오는데 실패했습니다');
    });
  });

  describe('엣지 케이스', () => {
    it('아이디어가 없을 때도 정상 처리한다', async () => {
      const req = createMockRequest();
      const params = createMockParams(mockIssueId);
      const mockReport = createMockReportData();
      mockReport.issue.ideas = [];

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport as any);

      const response = await GET(req, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.statistics.totalVotes).toBe(0);
      expect(data.statistics.maxCommentCount).toBe(0);
      expect(data.rankings.all).toHaveLength(0);
    });

    it('카테고리가 없는 아이디어를 미분류로 처리한다', async () => {
      const req = createMockRequest();
      const params = createMockParams(mockIssueId);
      const mockReport = createMockReportData();
      mockReport.issue.ideas[0].category = null as any;

      mockedFindReportWithDetailsById.mockResolvedValue(mockReport as any);

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.rankings.byCategory['미분류']).toBeDefined();
      expect(data.rankings.byCategory['미분류'][0].id).toBe('idea-1');
    });
  });
});
