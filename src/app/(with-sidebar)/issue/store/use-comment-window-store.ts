import { create } from 'zustand';

interface commentWindowState {
  activeCommentId: string | null;
  setActiveCommentId: (id: string | null) => void;
}

export const useCommentWindowStore = create<commentWindowState>((set) => ({
  activeCommentId: null,
  setActiveCommentId: (id) => set({ activeCommentId: id }),
}));
