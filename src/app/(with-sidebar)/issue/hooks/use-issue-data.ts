import { useEffect } from 'react';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { ISSUE_STATUS } from '@/constants/issue';
import { fetchIssueStatus } from '@/lib/api/issue';

export function useIssueData(issueId: string) {
  const { status, voteStatus, isAIStructuring } = useIssueStore();
  const { setInitialData, startVote } = useIssueStore((state) => state.actions);

  const isCreateIdeaActive = status === 'BRAINSTORMING';
  const isVoteActive = voteStatus === 'IN_PROGRESS';

  // Redis에서 이슈 상태 가져와서 초기화
  useEffect(() => {
    const initializeIssueStatus = async () => {
      const fetchedStatus = await fetchIssueStatus(issueId);
      setInitialData({
        id: issueId,
        status: fetchedStatus || ISSUE_STATUS.BRAINSTORMING,
      });
    };

    initializeIssueStatus();
  }, [issueId, setInitialData]);

  useEffect(() => {
    if (status === 'VOTE') {
      startVote();
    }
  }, [status]);

  return {
    status,
    voteStatus,
    isAIStructuring,
    isCreateIdeaActive,
    isVoteActive,
  };
}
