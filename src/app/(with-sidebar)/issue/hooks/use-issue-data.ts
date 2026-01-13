import { useEffect } from 'react';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { ISSUE_STATUS } from '@/constants/issue';
import { getIssue } from '@/lib/api/issue';
import { IssueStatus } from '@/types/issue';

export function useIssueData(issueId: string) {
  const { status, isAIStructuring } = useIssueStore();
  const { setInitialData } = useIssueStore((state) => state.actions);

  const VOTE_LIFECYCLE = [
    ISSUE_STATUS.VOTE,
    ISSUE_STATUS.SELECT,
    ISSUE_STATUS.CLOSE,
  ] as IssueStatus[];
  const VOTE_FINISHED_STATES = [ISSUE_STATUS.SELECT, ISSUE_STATUS.CLOSE] as IssueStatus[];

  const isCreateIdeaActive = status === ISSUE_STATUS.BRAINSTORMING;
  const isVoteActive = VOTE_LIFECYCLE.includes(status);
  const isVoteEnded = VOTE_FINISHED_STATES.includes(status);

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
    isAIStructuring,
    isCreateIdeaActive,
    isVoteActive,
    isVoteEnded,
  };
}
