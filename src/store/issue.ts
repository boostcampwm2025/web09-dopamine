import { create } from 'zustand';
import { ISSUE_STATUS, STEP_FLOW } from '@/constants/issue';
import { IssueStatus, VoteStatus } from '@/types/issue';

interface IssueStore {
  status: IssueStatus;
  voteStatus: VoteStatus;
  actions: {
    next: () => void;
    closeIssue: () => void;
    startVote: () => void;
    endVote: () => void;
  };
}

export const useIssueStore = create<IssueStore>((set) => ({
  status: ISSUE_STATUS.BRAINSTORMING,
  voteStatus: 'READY',

  actions: {
    next: () =>
      set((state) => {
        const currentIndex = STEP_FLOW.indexOf(state.status);
        const nextStatus = STEP_FLOW[currentIndex + 1];
        return { status: nextStatus };
      }),
    closeIssue: () => set(() => ({ status: ISSUE_STATUS.CLOSE })),
    startVote: () => set({ voteStatus: 'IN_PROGRESS' }),
    endVote: () => set({ voteStatus: 'COMPLETED' }),
  },
}));

export const useIsNextButtonVisible = () => {
  return useIssueStore((state) => {
    const hiddenStatus = [ISSUE_STATUS.SELECT, ISSUE_STATUS.CLOSE] as IssueStatus[];
    return !hiddenStatus.includes(state.status);
  });
};
