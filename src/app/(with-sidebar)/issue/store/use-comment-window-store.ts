import { create } from 'zustand';

interface commentWindowState {
  activeCommentId: string | null;
  commentPosition: { x: number; y: number } | null;
  setActiveCommentId: (id: string | null) => void;
  openComment: (id: string, pos: { x: number; y: number }) => void;
  closeComment: () => void;
}

export const useCommentWindowStore = create<commentWindowState>((set) => ({
  activeCommentId: null,
  commentPosition: null,
  setActiveCommentId: (id) => set({ activeCommentId: id }),
  openComment: (id, pos) => set({ activeCommentId: id, commentPosition: pos }),
  closeComment: () => set({ activeCommentId: null, commentPosition: null }),
}));
