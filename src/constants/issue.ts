import { VoteStatus } from '@/types/issue';

export const ISSUE_STATUS = {
  BRAINSTORMING: 'BRAINSTORMING',
  CATEGORIZE: 'CATEGORIZE',
  VOTE: 'VOTE',
  SELECT: 'SELECT',
  CLOSE: 'CLOSE',
} as const;

export const STEP_FLOW = [
  ISSUE_STATUS.BRAINSTORMING,
  ISSUE_STATUS.CATEGORIZE,
  ISSUE_STATUS.VOTE,
  ISSUE_STATUS.SELECT,
  ISSUE_STATUS.CLOSE,
];

export const STATUS_LABEL = {
  [ISSUE_STATUS.BRAINSTORMING]: '브레인스토밍',
  [ISSUE_STATUS.CATEGORIZE]: '카테고리화',
  [ISSUE_STATUS.VOTE]: '투표',
  [ISSUE_STATUS.SELECT]: '채택',
  [ISSUE_STATUS.CLOSE]: '종료',
};

export const BUTTON_TEXT_MAP: Record<VoteStatus, string> = {
  READY: '투표 시작',
  IN_PROGRESS: '투표 종료',
  COMPLETED: '재투표 시작',
};
