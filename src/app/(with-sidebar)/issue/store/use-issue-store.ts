import { create } from 'zustand';

interface IssueStore {
  isAIStructuring: boolean;
  onlineMemberIds: string[];
  actions: {
    setIsAIStructuring: (isLoading: boolean) => void;
    setOnlineMemberIds: (ids: string[]) => void;
  };
}

export const useIssueStore = create<IssueStore>((set) => ({
  isAIStructuring: false,
  onlineMemberIds: [],
  actions: {
    setIsAIStructuring: (isLoading) => set({ isAIStructuring: isLoading }),
    setOnlineMemberIds: (ids) => set({ onlineMemberIds: ids }),
  },
}));
