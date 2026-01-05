import { create } from 'zustand';
import { ISSUE_STATUS, STEP_FLOW } from '@/constants/issue';
import { IssueStatus } from '@/types/issue';

interface IssueStore {
  status: IssueStatus;
  next: () => void;
}

export const useIssueStore = create<IssueStore>((set) => ({
  status: ISSUE_STATUS.BRAINSTORMING,
  next: () =>
    set((state) => {
      const currentIndex = STEP_FLOW.indexOf(state.status);
      const nextStatus = STEP_FLOW[currentIndex + 1];
      return { status: nextStatus };
    }),
}));
