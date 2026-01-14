export interface Category {
  id: string;
  issueId: string;
  title: string;
  positionX: number | null;
  positionY: number | null;
  width?: number | null;
  height?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
}
