import { create } from 'zustand';

interface commentWindowState {
  activeCommentId: string | null;
  commentPosition: { x: number; y: number } | null;
  // 각 카드의 위치를 추적
  cardPositions: Record<string, { x: number; y: number; width: number; height: number }>;

  openComment: (id: string) => void;
  closeComment: () => void;
  updateCardPosition: (
    id: string,
    position: { x: number; y: number; width: number; height: number },
  ) => void;
}

export const useCommentWindowStore = create<commentWindowState>((set, get) => ({
  activeCommentId: null,
  commentPosition: null,
  cardPositions: {},

  openComment: (id) => {
    const cardPos = get().cardPositions[id];
    if (cardPos) {
      // 카드 오른쪽에 댓글창 위치 계산
      const newPosition = {
        x: cardPos.x + cardPos.width + 16,
        y: cardPos.y + cardPos.height - 168,
      };

      set({
        activeCommentId: id,
        commentPosition: newPosition,
      });
    } else {
      set({ activeCommentId: id, commentPosition: null });
    }
  },

  closeComment: () => set({ activeCommentId: null, commentPosition: null }),

  updateCardPosition: (ideaId, position) => {
    set((state) => ({
      cardPositions: {
        ...state.cardPositions,
        [ideaId]: position,
      },
    }));

    // 현재 열린 댓글이 이 카드의 댓글이면 위치 업데이트
    const activeId = get().activeCommentId;
    if (activeId === ideaId) {
      set({
        commentPosition: {
          x: position.x + position.width + 12,
          y: position.y + position.height - 168,
        },
      });
    }
  },
}));
