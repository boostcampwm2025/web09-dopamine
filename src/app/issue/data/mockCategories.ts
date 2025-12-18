import type { Category } from '../types/category';

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    title: '긴급 개선 필요',
    position: { x: 1300, y: 100 },
    muted: false,
  },
  {
    id: 'cat-2',
    title: '장기 프로젝트',
    position: { x: 1300, y: 500 },
    muted: false,
  },
  {
    id: 'cat-3',
    title: '보류',
    position: { x: 1300, y: 900 },
    muted: true,
  },
];
