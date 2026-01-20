import { create } from 'zustand';

interface IssueStore {
  isAIStructuring: boolean;
  actions: {
    setIsAIStructuring: (isLoading: boolean) => void;
  };
}

export const useIssueStore = create<IssueStore>((set) => ({
  isAIStructuring: false,
  actions: {
    setIsAIStructuring: (isLoading) => set({ isAIStructuring: isLoading }),
  },
}));
