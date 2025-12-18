export type IdeaCardMock = {
  id: string;
  content: string;
  author: string;
  isSelected?: boolean;
  isVotePhrase?: boolean;
  agreeCount?: number;
  disagreeCount?: number;
  needDiscussion?: boolean;
  editable?: boolean;
};

export const ideaCardMocks: IdeaCardMock[] = [
  {
    id: 'idea-001',
    content: '서비스 에러 로깅을 Sentry로 통일하고 대시보드 주간 점검하기',
    author: '지은',
    isSelected: true,
    isVotePhrase: true,
    agreeCount: 24,
    disagreeCount: 3,
  },
  {
    id: 'idea-002',
    content: '매일 스탠드업을 10분 안에 끝내는 타이머 추가',
    author: '태환',
    isVotePhrase: true,
    agreeCount: 14,
    disagreeCount: 6,
    needDiscussion: true,
  },
  {
    id: 'idea-003',
    content: '리뷰 요청 템플릿을 표준화해서 PR 가독성 높이기',
    author: '민수',
    isVotePhrase: true,
    agreeCount: 18,
    disagreeCount: 2,
  },
  {
    id: 'idea-004',
    content: '배포 전 체크리스트를 자동화하고 실패 시 알림 보내기',
    author: '서연',
    isVotePhrase: true,
    agreeCount: 21,
    disagreeCount: 5,
  },
  {
    id: 'idea-005',
    content: '디자인 시스템 토큰을 공통 패키지로 분리해 재사용성 높이기',
    author: '주원',
    isVotePhrase: false,
    needDiscussion: true,
  },
  {
    id: 'idea-006',
    content: '사용자 설문을 분기마다 진행해서 로드맵에 반영하기',
    author: '은지',
    isVotePhrase: true,
    agreeCount: 12,
    disagreeCount: 4,
  },
  {
    id: 'idea-007',
    content: '신규 기능 실험에 대해 A/B 테스트 가이드를 문서화하기',
    author: '지훈',
    isVotePhrase: true,
    agreeCount: 11,
    disagreeCount: 8,
  },
  {
    id: 'idea-008',
    content: '레거시 API 호출을 GraphQL 게이트웨이로 단계적 마이그레이션',
    author: '소연',
    isVotePhrase: false,
  },
  {
    id: 'idea-009',
    content: '온보딩용 더미 데이터를 자동으로 생성하는 스크립트 제공',
    author: '도윤',
    isVotePhrase: true,
    agreeCount: 9,
    disagreeCount: 1,
    editable: true,
  },
  {
    id: 'idea-010',
    content: 'Slack 릴리즈 노트를 매주 금요일 정리해 배포 공지로 공유',
    author: '세림',
    isVotePhrase: false,
  },
];
