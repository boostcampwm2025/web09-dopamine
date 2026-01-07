import { create } from 'zustand';
import { ISSUE_STATUS, STEP_FLOW } from '@/constants/issue';
import { IssueStatus, VoteStatus } from '@/types/issue';

interface IssueStore {
  id: string | null;
  status: IssueStatus;
  voteStatus: VoteStatus;
  actions: {
    setInitialData: (data: { id: string; status: IssueStatus }) => void;
    nextStep: (validate?: () => void) => void;
    closeIssue: () => void;
    startVote: () => void;
    endVote: () => void;
  };
}

export const useIssueStore = create<IssueStore>((set) => ({
  id: null,
  status: ISSUE_STATUS.BRAINSTORMING,
  voteStatus: 'READY',

  actions: {
    setInitialData: (data) => set(() => ({ id: data.id, status: data.status })),
    nextStep: (validate?: () => void) =>
      set((state) => {
        if (validate) {
          validate();
        }
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
