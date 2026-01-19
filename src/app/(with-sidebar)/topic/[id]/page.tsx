import { ISSUE_STATUS, ISSUE_STATUS_DESCRIPTION } from '@/constants/issue';
import TopicCanvas from '../_components/topic-canvas';

export default function TopicPage({ params }: { params: { id: string } }) {
  // 토픽 ID로 이슈 목록 데이터 불러오기
  const issues = [
    { id: 'issue1', title: '이슈 1', status: ISSUE_STATUS.BRAINSTORMING },
    { id: 'issue2', title: '이슈 2', status: ISSUE_STATUS.CATEGORIZE },
    { id: 'issue3', title: '이슈 3', status: ISSUE_STATUS.VOTE },
    { id: 'issue4', title: '이슈 4', status: ISSUE_STATUS.SELECT },
    { id: 'issue5', title: '이슈 5', status: ISSUE_STATUS.CLOSE },
  ];

  return <TopicCanvas issues={issues} />;
}
