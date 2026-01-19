export const SSE_EVENT_TYPES = {
  // 연결
  CONNECTED: 'connected',

  // 아이디어
  IDEA_CREATED: 'idea:created',
  IDEA_MOVED: 'idea:moved',
  IDEA_DELETED: 'idea:deleted',
  IDEA_SELECTED: 'idea:selected',

  // 카테고리
  CATEGORY_CREATED: 'category:created',
  CATEGORY_UPDATED: 'category:updated',
  CATEGORY_MOVED: 'category:moved',
  CATEGORY_DELETED: 'category:deleted',

  // ai 구조화
  AI_STRUCTURING_STARTED: 'ai_structuring:started',
  AI_STRUCTURING_COMPLETED: 'ai_structuring:completed',

  // 투표
  VOTE_CHANGED: 'vote:changed',

  // 이슈 상태
  ISSUE_STATUS_CHANGED: 'issue:status_changed',
  CLOSE_MODAL_OPENED: 'close_modal:opened',
  CLOSE_MODAL_CLOSED: 'close_modal:closed',
  CLOSE_MODAL_MEMO_UPDATED: 'close_modal:memo_updated',

  // 멤버
  MEMBER_JOINED: 'member:joined',
  MEMBER_LEFT: 'member:left',
} as const;

export type SSEEventType = (typeof SSE_EVENT_TYPES)[keyof typeof SSE_EVENT_TYPES];
