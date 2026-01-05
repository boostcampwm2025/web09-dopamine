import type { Position } from '@/app/(with-sidebar)/issue/types/idea';

export const IDEA_CARD = {
  WIDTH: 480,
  // TODO: 실제 콘텐츠 높이에 맞게 조정 필요
  HEIGHT: 220,
} as const;

export const CATEGORY_LAYOUT = {
  HEADER_HEIGHT: 60,
  PADDING: 20,
  GAP: 20, // 아이디어 카드 간격
  MAX_ROWS: 3, // 최대 행 개수
} as const;

export const calculateCategorySize = (itemCount: number) => {
  if (itemCount === 0) {
    // 아이디어 없을 때 최소 크기
    return {
      width: CATEGORY_LAYOUT.PADDING * 2 + IDEA_CARD.WIDTH,
      height: CATEGORY_LAYOUT.HEADER_HEIGHT + CATEGORY_LAYOUT.PADDING * 2 + IDEA_CARD.HEIGHT,
      cols: 1,
      rows: 1,
    };
  }

  // 세로로 MAX_ROWS까지만 쌓고 넘치면 다음 열로
  const rows = Math.min(itemCount, CATEGORY_LAYOUT.MAX_ROWS);
  const cols = Math.ceil(itemCount / CATEGORY_LAYOUT.MAX_ROWS);

  // 카테고리 너비 = 좌우 패딩 + (카드 전체 너비 * 열 수) + (간격 * (열 수 - 1))
  const width =
    CATEGORY_LAYOUT.PADDING * 2 + cols * IDEA_CARD.WIDTH + (cols - 1) * CATEGORY_LAYOUT.GAP;

  // 카테고리 높이 = 헤더 + 상하 패딩 + (카드 높이 * 행 수) + (간격 * (행 수 - 1))
  const height =
    CATEGORY_LAYOUT.HEADER_HEIGHT +
    CATEGORY_LAYOUT.PADDING * 2 +
    rows * IDEA_CARD.HEIGHT +
    (rows - 1) * CATEGORY_LAYOUT.GAP;

  return { width, height, cols, rows };
};

export const calculateGridPosition = (
  categoryPosition: Position,
  index: number,
  totalItems: number,
): Position => {
  const col = Math.floor(index / CATEGORY_LAYOUT.MAX_ROWS);
  const row = index % CATEGORY_LAYOUT.MAX_ROWS;

  const result = {
    x: categoryPosition.x + CATEGORY_LAYOUT.PADDING + col * (IDEA_CARD.WIDTH + CATEGORY_LAYOUT.GAP),
    y:
      categoryPosition.y +
      CATEGORY_LAYOUT.HEADER_HEIGHT +
      CATEGORY_LAYOUT.PADDING +
      row * (IDEA_CARD.HEIGHT + CATEGORY_LAYOUT.GAP),
  };
  return result;
};
