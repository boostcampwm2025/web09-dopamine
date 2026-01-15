import { create } from 'zustand';
import { IssueMember } from '@/types/issue';

interface IssueStore {
  id: string | null;
  isAIStructuring: boolean;
  isQuickIssue: boolean;
  actions: {
    startAIStructure: () => void;
    finishAIStructure: () => void;
  };
}

export const useIssueStore = create<IssueStore>((set) => ({
  id: null,
  isAIStructuring: false,
  isQuickIssue: true,

  actions: {
    startAIStructure: () => set({ isAIStructuring: true }),
    finishAIStructure: () => set({ isAIStructuring: false }),
  },
}));
