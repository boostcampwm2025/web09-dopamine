export interface Position {
  x: number;
  y: number;
}

export interface IdeaWithPosition {
  id: string;
  content: string;
  author: string;
  position: Position;
  isSelected?: boolean;
  isVotePhrase?: boolean;
  agreeCount?: number;
  disagreeCount?: number;
  needDiscussion?: boolean;
  editable?: boolean;
}
