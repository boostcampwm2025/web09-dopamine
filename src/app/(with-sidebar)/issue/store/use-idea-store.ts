import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IdeaWithPosition, Position } from '../types/idea';

interface IdeaStore {
  ideas: IdeaWithPosition[];
  addIdea: (idea: IdeaWithPosition) => void;
  updateIdeaContent: (id: string, content: string) => void;
  updateIdeaPosition: (id: string, position: Position) => void;
  updateIdeaEditable: (id: string, editable: boolean) => void;
  selectIdea: (id: string | null) => void;
  deleteIdea: (id: string) => void;
  setIdeas: (ideas: IdeaWithPosition[]) => void;
  clearIdeas: () => void;
}

const createIdeaStore = (issueId: string) => {
  return create<IdeaStore>()(
    persist(
      (set) => ({
        ideas: [],

        addIdea: (idea: IdeaWithPosition) =>
          set((state) => ({
            ideas: [...state.ideas, idea],
          })),

        updateIdeaContent: (id: string, content: string) =>
          set((state) => ({
            ideas: state.ideas.map((idea) =>
              idea.id === id ? { ...idea, content, editable: false } : idea,
            ),
          })),

        updateIdeaPosition: (id: string, position: Position) =>
          set((state) => ({
            ideas: state.ideas.map((idea) => (idea.id === id ? { ...idea, position } : idea)),
          })),

        updateIdeaEditable: (id: string, editable: boolean) =>
          set((state) => ({
            ideas: state.ideas.map((idea) => (idea.id === id ? { ...idea, editable } : idea)),
          })),

        selectIdea: (id: string | null) =>
          set((state) => ({
            ideas: state.ideas.map((idea) => ({
              ...idea,
              isSelected: id !== null && idea.id === id,
            })),
          })),

        deleteIdea: (id: string) =>
          set((state) => ({
            ideas: state.ideas.filter((idea) => idea.id !== id),
          })),

        setIdeas: (ideas: IdeaWithPosition[]) => set({ ideas }),

        clearIdeas: () => set({ ideas: [] }),
      }),
      {
        name: `idea-storage-${issueId}`, // 이슈별 localStorage key
      },
    ),
  );
};

const storeCache = new Map<string, ReturnType<typeof createIdeaStore>>();

export const useIdeaStore = (issueId: string = 'default') => {
  if (!storeCache.has(issueId)) {
    storeCache.set(issueId, createIdeaStore(issueId));
  }
  return storeCache.get(issueId)!();
};
