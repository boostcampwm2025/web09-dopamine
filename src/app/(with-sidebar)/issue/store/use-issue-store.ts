import { create } from 'zustand';

interface IssueStore {
  isAIStructuring: boolean;
  connectUserIds: string[];
  actions: {
    setIsAIStructuring: (isLoading: boolean) => void;
    setConnectUserIds: (ids: string[]) => void;
  };
}

export const useIssueStore = create<IssueStore>((set) => ({
  isAIStructuring: false,
  connectUserIds: [],
  actions: {
    setIsAIStructuring: (isLoading) => set({ isAIStructuring: isLoading }),
    setConnectUserIds: (ids) => set({ connectUserIds: ids }),
  },
}));
