export type CategoryMock = {
  key: string;
  title: string;
  muted?: boolean;
};

export const categoryMocks: CategoryMock[] = [
  { key: 'withCategory', title: '카테고리 분류 완료' },
  { key: 'withCategory2', title: '검토 필요 아이디어' },
  { key: 'noCategory', title: '분류 대기', muted: true },
];
