import { create } from 'zustand';
import { IssueMember } from '@/types/issue';

interface IssueStore {
  isAIStructuring: boolean;
  actions: {
    startAIStructure: () => void;
    finishAIStructure: () => void;
  };
}

export const useIssueStore = create<IssueStore>((set) => ({
  isAIStructuring: false,

  actions: {
    startAIStructure: () => set({ isAIStructuring: true }),
    finishAIStructure: () => set({ isAIStructuring: false }),
  },
}));
