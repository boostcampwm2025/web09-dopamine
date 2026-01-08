import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category } from '../types/category';
import type { Position } from '../types/idea';

interface CategoryStore {
  categories: Category[];
  addCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  updateCategoryPosition: (id: string, position: Position) => void;
  updateCategoryTitle: (id: string, title: string) => void;
  setCategories: (categories: Category[]) => void;
}

const createCategoryStore = (issueId: string) => {
  return create<CategoryStore>()(
    persist(
      (set) => ({
        categories: [],

        addCategory: (category: Category) =>
          set((state) => ({
            categories: [...state.categories, category],
          })),

        deleteCategory: (id: string) =>
          set((state) => ({
            categories: state.categories.filter((cat) => cat.id !== id),
          })),

        updateCategoryPosition: (id: string, position: Position) =>
          set((state) => ({
            categories: state.categories.map((cat) => (cat.id === id ? { ...cat, position } : cat)),
          })),

        updateCategoryTitle: (id: string, title: string) =>
          set((state) => ({
            categories: state.categories.map((cat) => (cat.id === id ? { ...cat, title } : cat)),
          })),

        setCategories: (categories: Category[]) => set({ categories }),
      }),
      {
        name: `category-storage-${issueId}`,
      },
    ),
  );
};

const storeCache = new Map<string, ReturnType<typeof createCategoryStore>>();

export const useCategoryStore = (issueId: string = 'default') => {
  if (!storeCache.has(issueId)) {
    storeCache.set(issueId, createCategoryStore(issueId));
  }
  return storeCache.get(issueId)!();
};
