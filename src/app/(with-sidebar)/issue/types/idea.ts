export interface Position {
  x: number;
  y: number;
}

export interface Idea {
  id: string;
  userId: string;
  content: string;
  author: string;
  category: string;
  agreeCount: number;
  disagreeCount: number;
  highlighted: boolean;
}

export interface IdeaWithPosition {
  id: string;
  userId: string;
  content: string;
  author: string;
  categoryId: string | null;
  position: Position | null;
  isSelected?: boolean;
  isVoteButtonVisible?: boolean;
  isVoteDisabled?: boolean;
  agreeCount?: number;
  disagreeCount?: number;
  commentCount?: number;
  myVote?: 'AGREE' | 'DISAGREE' | null;
  needDiscussion?: boolean;
  editable?: boolean;
  comments?: Array<{
    id: string;
    content: string;
    createdAt: Date | string;
  }>;
}

export type CardStatus = 'mostLiked' | 'needDiscussion' | 'selected' | 'default';
