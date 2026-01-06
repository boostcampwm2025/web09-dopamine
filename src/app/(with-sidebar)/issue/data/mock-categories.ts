import type { Category } from '../types/category';

// AI 구조화 버튼으로 생성되므로 초기에는 빈 배열
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    title: 'SNS 마케팅',
    position: { x: 100, y: 100 },
    isMuted: false,
  },
  {
    id: 'cat-2',
    title: '콘텐츠 제작',
    position: { x: 700, y: 100 },
    isMuted: false,
  },
  {
    id: 'cat-3',
    title: '커뮤니티 활동',
    position: { x: 500, y: 1000 },
    isMuted: false,
  },
];
