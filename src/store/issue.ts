import { create } from 'zustand';
import { ISSUE_STATUS, STEP_FLOW } from '@/constants/issue';
import { IssueStatus } from '@/types/issue';

interface IssueStore {
  status: IssueStatus;
  isVoteActive: boolean;
  actions: {
    next: () => void;
    closeIssue: () => void;
    toggleVoteActvie: () => void;
  };
}

export const useIssueStore = create<IssueStore>((set) => ({
  status: ISSUE_STATUS.BRAINSTORMING,
  isVoteActive: false,

  actions: {
    next: () =>
      set((state) => {
        const currentIndex = STEP_FLOW.indexOf(state.status);
        const nextStatus = STEP_FLOW[currentIndex + 1];
        return { status: nextStatus };
      }),
    closeIssue: () => set(() => ({ status: ISSUE_STATUS.CLOSE })),
    toggleVoteActvie: () => set((state) => ({ isVoteActive: !state.isVoteActive })),
  },
}));

export const useIsNextButtonVisible = () => {
  return useIssueStore((state) => {
    const hiddenStatus = [ISSUE_STATUS.SELECT, ISSUE_STATUS.CLOSE] as IssueStatus[];
    return !hiddenStatus.includes(state.status);
  });
};
