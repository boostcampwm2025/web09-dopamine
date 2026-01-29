import { findReportWithDetailsById } from '@/lib/repositories/report.repository';
import {
  CategoryDto,
  CategoryRanking,
  RankedIdeaDto,
  ReportResponse,
  ReportWithDetails,
} from '@/types/report';
import { assignRank, compareIdeasByVote } from '../utils/sort-ideas';

type ReportIdea = ReportWithDetails['issue']['ideas'][number];

const mapIdeaToRankedIdea = (
  idea: ReportIdea,
  issueMembers: ReportWithDetails['issue']['issueMembers'],
  selectedIdeaId: string | null,
): RankedIdeaDto => {
  // issueMember에서 nickname 찾기
  const userId = idea.user?.id ?? null;
  const issueMember = userId ? issueMembers.find((member) => member.userId === userId) : undefined;
  const nickname = issueMember?.nickname || idea.user?.name || '익명';

  return {
    id: idea.id,
    content: idea.content,
    agreeCount: idea.agreeCount,
    disagreeCount: idea.disagreeCount,
    commentCount: idea.comments.length,
    category: idea.category as CategoryDto | null,
    user: idea.user
      ? {
        ...idea.user,
        displayName: nickname, // 하위 호환성을 위해 유지
        nickname,
      }
      : null,
    isSelected: idea.id === selectedIdeaId,
  };
};

export async function getReportSummaryByIssueId(issueId: string): Promise<ReportResponse | null> {
  const report = await findReportWithDetailsById(issueId);

  if (!report) {
    return null;
  }

  // 투표 결과에 들어갈 내용
  const totalParticipants = report.issue.issueMembers.length;
  const totalVotes = report.issue.ideas.reduce(
    (sum, idea) => sum + idea.agreeCount + idea.disagreeCount,
    0,
  );
  const maxCommentCount = Math.max(...report.issue.ideas.map((idea) => idea.comments.length), 0);

  // 아이디어 랭킹 계산
  const rankedIdeas: RankedIdeaDto[] = report.issue.ideas
    .map((idea) => mapIdeaToRankedIdea(idea, report.issue.issueMembers, report.selectedIdeaId))
    .sort(compareIdeasByVote);

  const assignedRankedIdeas = assignRank(rankedIdeas, compareIdeasByVote);

  // 카테고리별로 아이디어 그룹핑
  const categoryMap = report.issue.ideas.reduce(
    (acc, idea) => {
      const categoryId = idea.category?.id || 'uncategorized';
      const categoryTitle = idea.category?.title || '미분류';

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          categoryTitle,
          ideas: [],
        };
      }
      acc[categoryId].ideas.push(
        mapIdeaToRankedIdea(idea, report.issue.issueMembers, report.selectedIdeaId),
      );
      return acc;
    },
    {} as Record<string, CategoryRanking>,
  );

  // 각 카테고리의 아이디어를 정렬하고 배열로 변환
  const categorizedIdeas: CategoryRanking[] = Object.values(categoryMap).map((category) => {
    const sortedCategoryIdeas = category.ideas.sort(compareIdeasByVote);

    return {
      ...category,
      ideas: assignRank(sortedCategoryIdeas, compareIdeasByVote),
    };
  });

  return {
    id: report.id,
    memo: report.memo,
    selectedIdea: report.selectedIdea
      ? {
        id: report.selectedIdea.id,
        content: report.selectedIdea.content,
        voteCount: report.selectedIdea.agreeCount + report.selectedIdea.disagreeCount,
        commentCount: report.selectedIdea.comments.length,
        category: report.selectedIdea.category as CategoryDto | null,
      }
      : null,
    statistics: {
      totalParticipants,
      totalVotes,
      maxCommentCount,
    },
    rankings: {
      all: assignedRankedIdeas,
      byCategory: categorizedIdeas,
    },
  };
}
