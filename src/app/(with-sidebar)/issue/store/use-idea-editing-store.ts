import { create } from 'zustand';

interface IdeaEditingState {
  editingIds: string[];
  setEditing: (ideaId: string, isEditing: boolean) => void;
}

const createIdeaEditingStore = () =>
  create<IdeaEditingState>((set) => ({
    editingIds: [],
    setEditing: (ideaId, isEditing) =>
      set((state) => {
        const exists = state.editingIds.includes(ideaId);
        if (isEditing && !exists) {
          return { editingIds: [...state.editingIds, ideaId] };
        }
        if (!isEditing && exists) {
          return { editingIds: state.editingIds.filter((id) => id !== ideaId) };
        }
        return state;
      }),
  }));

const storeCache = new Map<string, ReturnType<typeof createIdeaEditingStore>>();

export function useIdeaEditingStore(issueId?: string): IdeaEditingState;
export function useIdeaEditingStore<T>(
  issueId: string,
  selector: (state: IdeaEditingState) => T,
): T;
export function useIdeaEditingStore<T>(
  issueId: string = 'default',
  selector?: (state: IdeaEditingState) => T,
) {
  if (!storeCache.has(issueId)) {
    storeCache.set(issueId, createIdeaEditingStore());
  }
  const store = storeCache.get(issueId)!;
  return selector ? store(selector) : store();
}
