import type { IdeaWithPosition } from '../types/idea';

export const mockIdeasWithPosition: IdeaWithPosition[] = [
  // 캔버스에 자유 배치된 아이디어들 (categoryId: null)
  {
    id: 'idea-001',
    content: '서비스 에러 로깅을 Sentry로 통일하고 대시보드 주간 점검하기',
    author: '지은',
    categoryId: null,
    position: { x: 100, y: 100 },
    agreeCount: 24,
    disagreeCount: 3,
  },
  {
    id: 'idea-002',
    content: '매일 스탠드업을 10분 안에 끝내는 타이머 추가',
    author: '태환',
    categoryId: null,
    position: { x: 500, y: 100 },
    agreeCount: 14,
    disagreeCount: 6,
  },
  {
    id: 'idea-003',
    content: '리뷰 요청 템플릿을 표준화해서 PR 가독성 높이기',
    author: '민수',
    categoryId: null,
    position: { x: 900, y: 100 },
    agreeCount: 18,
    disagreeCount: 2,
  },
  // 카테고리에 속한 아이디어들
  {
    id: 'idea-004',
    content: '배포 전 체크리스트를 자동화하고 실패 시 알림 보내기',
    author: '서연',
    categoryId: 'cat-1',
    position: null,
    agreeCount: 21,
    disagreeCount: 5,
  },
  {
    id: 'idea-005',
    content: '디자인 시스템 토큰을 공통 패키지로 분리해 재사용성 높이기',
    author: '주원',
    categoryId: 'cat-1',
    position: null,
  },
  {
    id: 'idea-006',
    content: '사용자 설문을 분기마다 진행해서 로드맵에 반영하기',
    author: '은지',
    categoryId: 'cat-2',
    position: null,
    agreeCount: 12,
    disagreeCount: 4,
  },
  {
    id: 'idea-007',
    content: '신규 기능 실험에 대해 A/B 테스트 가이드를 문서화하기',
    author: '지훈',
    categoryId: 'cat-2',
    position: null,
    agreeCount: 11,
    disagreeCount: 8,
  },
  {
    id: 'idea-008',
    content: '레거시 API 호출을 GraphQL 게이트웨이로 단계적 마이그레이션',
    author: '소연',
    categoryId: 'cat-3',
    position: null,
  },
];
