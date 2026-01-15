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

  // 투표
  VOTE_CHANGED: 'vote:changed',

  // 이슈 상태
  ISSUE_STATUS_CHANGED: 'issue:status_changed',

  // 멤버
  MEMBER_JOINED: 'member:joined',
  MEMBER_LEFT: 'member:left',
} as const;

export type SSEEventType = (typeof SSE_EVENT_TYPES)[keyof typeof SSE_EVENT_TYPES];
