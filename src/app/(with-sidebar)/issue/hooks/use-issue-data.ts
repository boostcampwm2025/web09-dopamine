import { useEffect } from 'react';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { ISSUE_STATUS } from '@/constants/issue';
import { getIssue } from '@/lib/api/issue';


export function useIssueData(issueId: string) {
  const { status, voteStatus, isAIStructuring } = useIssueStore();
  const { setInitialData } = useIssueStore((state) => state.actions);

  const isCreateIdeaActive = status === ISSUE_STATUS.BRAINSTORMING;
  const isVoteActive = voteStatus === 'IN_PROGRESS';

  // Redis에서 이슈 상태 가져와서 초기화
  useEffect(() => {
    const initializeIssueStatus = async () => {
      const issue = await getIssue(issueId);
      if (issue) {
        setInitialData({
          id: issueId,
          status: issue.status || ISSUE_STATUS.BRAINSTORMING,
        });
      }
    };

    initializeIssueStatus();
  }, [issueId, setInitialData]);

  return {
    status,
    voteStatus,
    isAIStructuring,
    isCreateIdeaActive,
    isVoteActive,
  };
}
