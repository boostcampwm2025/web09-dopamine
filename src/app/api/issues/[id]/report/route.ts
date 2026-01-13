import { NextRequest, NextResponse } from 'next/server';
import { findReportWithDetailsById } from '@/lib/repositories/report.repository';
import { CategoryDto, RankedIdeaDto, ReportResponse, ReportWithDetails } from '@/types/report';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const issueId = params.id;

    const report: ReportWithDetails | null = await findReportWithDetailsById(issueId);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // 아래 로직은 나중에 Serivce 레이어로 분리될 수 있음

    // 투표 통계 계산
    const totalParticipants = report.issue.issueMembers.length; // 총 참여자 수
    const totalVotes = report.issue.ideas.reduce(
      // 총 투표수
      (sum, idea) => sum + idea.votes.length,
      0,
    );

    // 가장 많은 댓글을 받은 아이디어의 댓글 수
    const maxCommentCount = Math.max(...report.issue.ideas.map((idea) => idea.comments.length), 0);

    // 아이디어 랭킹 계산 (투표 수 기준)
    const rankedIdeas: RankedIdeaDto[] = report.issue.ideas
      .map((idea) => ({
        id: idea.id,
        content: idea.content,
        voteCount: idea.votes.length,
        commentCount: idea.comments.length,
        category: idea.category as CategoryDto | null,
        user: idea.user,
      }))
      .sort((a, b) => b.voteCount - a.voteCount); // 내림차순 정렬

    // 카테고리별 랭킹
    const categorizedIdeas = report.issue.ideas.reduce(
      (acc, idea) => {
        const categoryTitle = idea.category?.title || '미분류';
        if (!acc[categoryTitle]) {
          acc[categoryTitle] = [];
        }
        acc[categoryTitle].push({
          id: idea.id,
          content: idea.content,
          voteCount: idea.votes.length,
          commentCount: idea.comments.length,
          category: idea.category as CategoryDto | null,
          user: idea.user,
        });
        return acc;
      },
      {} as Record<string, RankedIdeaDto[]>,
    );

    // 각 카테고리별로 정렬
    Object.keys(categorizedIdeas).forEach((category) => {
      categorizedIdeas[category].sort((a, b) => b.voteCount - a.voteCount);
    });

    const responseData: ReportResponse = {
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

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Failed to fetch report:', error);
    return NextResponse.json({ error: '리포트를 가져오는데 실패했습니다' }, { status: 500 });
  }
}
