import { findReportWithDetailsById } from '@/lib/repositories/report.repository';
import { CategoryDto, RankedIdeaDto, ReportResponse, ReportWithDetails } from '@/types/report';

type ReportIdea = ReportWithDetails['issue']['ideas'][number];

const mapIdeaToRankedIdea = (idea: ReportIdea): RankedIdeaDto => ({
  id: idea.id,
  content: idea.content,
  agreeVoteCount: idea.votes.filter((vote) => vote.type === 'AGREE').length,
  disagreeVoteCount: idea.votes.filter((vote) => vote.type === 'DISAGREE').length,
  commentCount: idea.comments.length,
  category: idea.category as CategoryDto | null,
  user: idea.user,
});

export async function getReportSummaryByIssueId(issueId: string): Promise<ReportResponse | null> {
  const report = await findReportWithDetailsById(issueId);

  if (!report) {
    return null;
  }

  // 투표 결과에 들어갈 내용
  const totalParticipants = report.issue.issueMembers.length;
  const totalVotes = report.issue.ideas.reduce((sum, idea) => sum + idea.votes.length, 0);
  const maxCommentCount = Math.max(...report.issue.ideas.map((idea) => idea.comments.length), 0);

  // 아이디어 랭킹 계산
  const rankedIdeas: RankedIdeaDto[] = report.issue.ideas
    .map(mapIdeaToRankedIdea)
    .sort(
      (a, b) => b.agreeVoteCount - b.disagreeVoteCount - (a.agreeVoteCount - a.disagreeVoteCount),
    ); // 내림차순 정렬

  const categorizedIdeas = report.issue.ideas.reduce(
    (acc, idea) => {
      const categoryTitle = idea.category?.title || '미분류';
      if (!acc[categoryTitle]) {
        acc[categoryTitle] = [];
      }
      acc[categoryTitle].push(mapIdeaToRankedIdea(idea));
      return acc;
    },
    {} as Record<string, RankedIdeaDto[]>,
  );

  Object.values(categorizedIdeas).forEach((ideas) => {
    ideas.sort(
      (a, b) => b.agreeVoteCount - b.disagreeVoteCount - (a.agreeVoteCount - a.disagreeVoteCount),
    );
  });

  return {
    id: report.id,
    memo: report.memo,
    selectedIdea: report.selectedIdea
      ? {
          id: report.selectedIdea.id,
          content: report.selectedIdea.content,
          voteCount: report.selectedIdea.votes.length,
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
      all: rankedIdeas,
      byCategory: categorizedIdeas,
    },
  };
}
