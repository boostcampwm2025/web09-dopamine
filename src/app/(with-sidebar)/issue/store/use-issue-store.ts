import { create } from 'zustand';
import { IssueMember } from '@/types/issue';

interface IssueStore {
  id: string | null;
  isAIStructuring: boolean;
  isQuickIssue: boolean;
  members: IssueMember[];
  actions: {
    startAIStructure: () => void;
    finishAIStructure: () => void;
    setMembers: (members: IssueMember[]) => void;
    upsertMember: (member: IssueMember) => void;
  };
}

export const useIssueStore = create<IssueStore>((set) => ({
  id: null,
  isAIStructuring: false,
  isQuickIssue: true,
  members: [],

  actions: {
    setMembers: (members) => set({ members }),

    upsertMember: (member) =>
      set((state) => {
        const idx = state.members.findIndex((m) => m.id === member.id);
        if (idx === -1) return { members: [...state.members, member] };

        const next = [...state.members];
        next[idx] = { ...next[idx], ...member };
        return { members: next };
      }),
    startAIStructure: () => set({ isAIStructuring: true }),
    finishAIStructure: () => set({ isAIStructuring: false }),
  },
}));
