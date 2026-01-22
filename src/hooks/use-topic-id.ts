import { useParams, usePathname } from 'next/navigation';
import { useIssueQuery } from '@/app/(with-sidebar)/issue/hooks';

/**
 * 현재 페이지의 topicId를 반환하는 커스텀 훅
 * - 토픽 페이지: URL params에서 직접 추출
 * - 이슈 페이지: 이슈 데이터에서 topicId 추출
 */
export const useTopicId = () => {
  const params = useParams();
  const pathname = usePathname();

  const isTopicPage = pathname?.startsWith('/topic');
  const topicIdFromUrl = isTopicPage ? (params.id as string) : null;

  // 이슈 페이지에서는 이슈 데이터에서 topicId 가져오기
  const issueId = !isTopicPage ? (params.id as string) : '';
  const { data: issue } = useIssueQuery(issueId);
  const topicIdFromIssue = issue?.topicId;

  return isTopicPage ? topicIdFromUrl : topicIdFromIssue;
};
