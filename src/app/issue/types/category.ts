import type { Position } from './idea';

export interface Category {
  id: string;
  title: string;
  position: Position;
  muted?: boolean;
}
