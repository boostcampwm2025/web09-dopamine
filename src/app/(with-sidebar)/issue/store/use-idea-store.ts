import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IdeaWithPosition, Position } from '../types/idea';

interface IdeaStore {
  ideas: IdeaWithPosition[];
  addIdea: (idea: IdeaWithPosition) => void;
  updateIdeaContent: (id: string, content: string) => void;
  updateIdeaPosition: (id: string, position: Position) => void;
  updateIdeaEditable: (id: string, editable: boolean) => void;
  deleteIdea: (id: string) => void;
  setIdeas: (ideas: IdeaWithPosition[]) => void;
  clearIdeas: () => void;
}

const createIdeaStore = (issueId: string) => {
  return create<IdeaStore>()(
    persist(
      (set) => ({
        ideas: [],

        addIdea: (idea) =>
          set((state) => ({
            ideas: [...state.ideas, idea],
          })),

        updateIdeaContent: (id, content) =>
          set((state) => ({
            ideas: state.ideas.map((idea) =>
              idea.id === id ? { ...idea, content, editable: false } : idea,
            ),
          })),

        updateIdeaPosition: (id, position) =>
          set((state) => ({
            ideas: state.ideas.map((idea) => (idea.id === id ? { ...idea, position } : idea)),
          })),

        updateIdeaEditable: (id, editable) =>
          set((state) => ({
            ideas: state.ideas.map((idea) => (idea.id === id ? { ...idea, editable } : idea)),
          })),

        deleteIdea: (id) =>
          set((state) => ({
            ideas: state.ideas.filter((idea) => idea.id !== id),
          })),

        setIdeas: (ideas) => set({ ideas }),

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
