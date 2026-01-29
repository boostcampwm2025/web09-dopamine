export interface CreateIdeaRequest {
  content: string;
  userId: string;
  positionX?: number;
  positionY?: number;
  categoryId: string | null;
}

export interface Idea {
  id: string;
  issueId: string;
  userId: string;
  categoryId: string | null;
  content: string;
  memo: string | null;
  positionX: number | null;
  positionY: number | null;
  agreeCount?: number;
  disagreeCount?: number;
  myVote?: 'AGREE' | 'DISAGREE' | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
  user?: {
    id: string;
    name: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
  issueMember?: {
    nickname: string;
  } | null;
  category?: {
    id: string;
    title: string;
  } | null;
  votes?: Array<{
    id: string;
    type: 'UP' | 'DOWN';
    userId: string;
  }>;
  comments?: Array<{
    id: string;
    content: string;
    createdAt: Date | string;
  }>;
}

export interface SimpleIdea {
  id: string;
  userId: string;
  content: string;
  positionX: number | null;
  positionY: number | null;
  categoryId: string | null;
  nickname: string;
  agreeCount: number;
  disagreeCount: number;
  commentCount: number;
  myVote: 'AGREE' | 'DISAGREE' | null;
  isSelected: boolean;
  createdAt: Date | string;
}
