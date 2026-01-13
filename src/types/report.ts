// Repository에서 반환하는 리포트 데이터 (Prisma include 결과)
export interface ReportWithDetails {
  id: string;
  issueId: string;
  selectedIdeaId: string | null;
  memo: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  issue: {
    id: string;
    title: string;
    issueMembers: Array<{
      id: string;
      userId: string;
      deletedAt: Date | null;
    }>;
    ideas: Array<{
      id: string;
      content: string;
      votes: Array<{ id: string; type: string }>;
      comments: Array<{ id: string }>;
      category: {
        id: string;
        title: string;
      } | null;
      user: {
        id: string;
        name: string | null;
        displayName: string | null;
        avatarUrl: string | null;
      };
    }>;
  };
  selectedIdea: {
    id: string;
    content: string;
    votes: Array<{ id: string }>;
    comments: Array<{ id: string }>;
    category: {
      id: string;
      title: string;
    } | null;
  } | null;
}

// 리포트 조회 응답 DTO
export interface ReportResponse {
  id: string;
  memo: string | null;
  selectedIdea: SelectedIdeaDto | null;
  statistics: ReportStatistics;
  rankings: ReportRankings;
}

// 선택된 아이디어 정보
export interface SelectedIdeaDto {
  id: string;
  content: string;
  voteCount: number;
  commentCount: number;
  category: CategoryDto | null;
}

// 카테고리 정보
export interface CategoryDto {
  id: string;
  title: string;
}

// 리포트 통계 정보
export interface ReportStatistics {
  totalParticipants: number; // 총 참여자 수
  totalVotes: number; // 총 투표 수
  maxCommentCount: number; // 가장 많은 댓글 수
}

// 아이디어 랭킹 정보
export interface ReportRankings {
  all: RankedIdeaDto[]; // 전체 순위
  byCategory: Record<string, RankedIdeaDto[]>; // 카테고리별 순위
}

// 랭킹에 사용되는 아이디어 정보
export interface RankedIdeaDto {
  id: string;
  content: string;
  agreeVoteCount: number;
  disagreeVoteCount: number;
  commentCount: number;
  category: CategoryDto | null;
  user: UserDto;
}

// 사용자 정보
export interface UserDto {
  id: string;
  name: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}
