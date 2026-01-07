import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IdeaCardStackState {
  cardStack: string[];
  setInitialData: (cardIds: string[]) => void;
  bringToFront: (cardId: string) => void;
  addCard: (cardId: string) => void;
  removeCard: (cardId: string) => void;
  getZIndex: (cardId: string) => number;
}

const createIdeaCardStackStore = (issueId: string) => {
  return create<IdeaCardStackState>()(
    persist(
      (set, get) => ({
        cardStack: [],

        setInitialData: (cardIds: string[]) =>
          set(() => ({
            cardStack: cardIds,
          })),

        bringToFront: (cardId: string) =>
          set((state) => {
            if (state.cardStack[state.cardStack.length - 1] === cardId) {
              return state;
            }
            return {
              cardStack: [...state.cardStack.filter((id) => id !== cardId), cardId],
            };
          }),

        addCard: (cardId: string) =>
          set((state) => {
            if (state.cardStack.includes(cardId)) {
              return state;
            }
            return {
              cardStack: [...state.cardStack, cardId],
            };
          }),

        removeCard: (cardId: string) =>
          set((state) => ({
            cardStack: state.cardStack.filter((id) => id !== cardId),
          })),

        getZIndex: (cardId: string) => {
          const index = get().cardStack.indexOf(cardId);
          return index === -1 ? 0 : index + 1; // 1부터 시작
        },
      }),
      {
        name: `idea-card-stack-storage-${issueId}`,
        partialize: (state) => ({
          cardStack: state.cardStack,
        }),
      },
    ),
  );
};

const storeCache = new Map<string, ReturnType<typeof createIdeaCardStackStore>>();

export const useIdeaCardStackStore = (issueId: string = 'default') => {
  if (!storeCache.has(issueId)) {
    storeCache.set(issueId, createIdeaCardStackStore(issueId));
  }
  return storeCache.get(issueId)!();
};
