import { IssueStatus, VoteStatus } from '@/types/issue';

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

export const ISSUE_STATUS_DESCRIPTION: Record<IssueStatus, string> = {
  BRAINSTORMING: '배경을 더블클릭하여 새로운 아이디어를 자유롭게 작성해보세요.',
  CATEGORIZE: 'AI 카테고리화 버튼을 눌러 아이디어를 간편하게 구조화해보세요.',
  VOTE: '아이디어에 투표하고, 상단 필터를 활용해 논의가 필요한 아이디어를 중심으로 결론을 좁혀보세요.',
  SELECT: '투표 결과를 참고해 팀의 최종 아이디어를 결정해보세요.',
  CLOSE: '',
};
