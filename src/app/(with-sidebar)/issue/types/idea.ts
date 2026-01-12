export interface Position {
  x: number;
  y: number;
}

export interface Idea {
  id: string;
  content: string;
  author: string;
  category: string;
  agreeCount: number;
  disagreeCount: number;
  highlighted: boolean;
}

export interface IdeaWithPosition {
  id: string;
  content: string;
  author: string;
  categoryId: string | null;
  position: Position | null;
  isSelected?: boolean;
  isVotePhase?: boolean;
  isVoteEnded?: boolean;
  agreeCount?: number;
  disagreeCount?: number;
  needDiscussion?: boolean;
  editable?: boolean;
}
