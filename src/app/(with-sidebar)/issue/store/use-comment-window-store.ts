import { create } from 'zustand';

interface commentWindowState {
  activeCommentId: string | null;

  openComment: (id: string) => void;
  closeComment: () => void;
}

export const useCommentWindowStore = create<commentWindowState>((set) => ({
  activeCommentId: null,

  openComment: (id) => set({ activeCommentId: id }),
  closeComment: () => set({ activeCommentId: null }),
}));
