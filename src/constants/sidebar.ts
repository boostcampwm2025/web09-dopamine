// 레이아웃·스타일에서 공통으로 쓰는 사이드바 치수
export const SIDEBAR_WIDTH = 256;
export const SIDEBAR_TOGGLE_WIDTH = 12;
export const SIDEBAR_TOGGLE_HEIGHT = 48;
export const SIDEBAR_TOGGLE_BORDER_RADIUS = 4;

// 토글이 보일 때 래퍼 전체 너비 (사이드바 + 토글)
export const SIDEBAR_WRAPPER_OPEN_WIDTH = SIDEBAR_WIDTH + SIDEBAR_TOGGLE_WIDTH;

// 접힌 상태일 때 래퍼 너비 (토글만)
export const SIDEBAR_WRAPPER_COLLAPSED_WIDTH = SIDEBAR_TOGGLE_WIDTH;
