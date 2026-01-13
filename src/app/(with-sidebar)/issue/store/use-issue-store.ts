import { create } from 'zustand';
import { ISSUE_STATUS, STEP_FLOW } from '@/constants/issue';
import { IssueStatus } from '@/types/issue';

interface IssueStore {
  id: string | null;
  status: IssueStatus;
  isAIStructuring: boolean;
  actions: {
    setInitialData: (data: { id: string; status: IssueStatus }) => void;
    nextStep: (validate?: () => void) => Promise<void>;
    closeIssue: () => void;
    startAIStructure: () => void;
    finishAIStructure: () => void;
  };
}

export const useIssueStore = create<IssueStore>((set) => ({
  id: null,
  status: ISSUE_STATUS.BRAINSTORMING,
  isAIStructuring: false,

  actions: {
    setInitialData: (data) => set(() => ({ id: data.id, status: data.status })),

    nextStep: async (validate?: () => void) => {
      if (validate) {
        validate();
      }

      const state = useIssueStore.getState();
      const currentIndex = STEP_FLOW.indexOf(state.status);
      const nextStatus = STEP_FLOW[currentIndex + 1];

      // 서버에 저장
      try {
        const response = await fetch(`/api/issues/${state.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        });

        if (!response.ok) throw new Error('Failed to update status');

        set({ status: nextStatus });
      } catch (error) {
        console.error('이슈 상태 업데이트 실패', error);
      }
    },

    closeIssue: () => set(() => ({ status: ISSUE_STATUS.CLOSE })),
    startAIStructure: () => set({ isAIStructuring: true }),
    finishAIStructure: () => set({ isAIStructuring: false }),
  },
}));

export const useIsNextButtonVisible = () => {
  return useIssueStore((state) => {
    const hiddenStatus = [ISSUE_STATUS.SELECT, ISSUE_STATUS.CLOSE] as IssueStatus[];
    return !hiddenStatus.includes(state.status);
  });
};
