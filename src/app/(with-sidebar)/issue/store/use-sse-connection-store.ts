import { create } from 'zustand';

interface SseConnectionStore {
  connectionIds: Record<string, string | undefined>;
  setConnectionId: (issueId: string, connectionId: string | null) => void;
}

export const useSseConnectionStore = create<SseConnectionStore>((set) => ({
  connectionIds: {},
  setConnectionId: (issueId, connectionId) =>
    set((state) => {
      if (!connectionId) {
        const next = { ...state.connectionIds };
        delete next[issueId]; // 나갔으면 삭제
        return { connectionIds: next };
      }

      return {
        connectionIds: {
          ...state.connectionIds,
          [issueId]: connectionId,
        },
      };
    }),
}));
