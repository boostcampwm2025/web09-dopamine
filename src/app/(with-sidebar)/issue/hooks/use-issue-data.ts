import { useEffect } from 'react';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { ISSUE_STATUS } from '@/constants/issue';
import { getIssue, getIssueMembers } from '@/lib/api/issue';
import { IssueMember, IssueStatus } from '@/types/issue';

export function useIssueData(issueId: string) {
  const { status, isAIStructuring } = useIssueStore();
  const { setInitialData, setMembers } = useIssueStore((state) => state.actions);

  const VOTE_LIFECYCLE = [
    ISSUE_STATUS.VOTE,
    ISSUE_STATUS.SELECT,
    ISSUE_STATUS.CLOSE,
  ] as IssueStatus[];
  const VOTE_FINISHED_STATES = [ISSUE_STATUS.SELECT, ISSUE_STATUS.CLOSE] as IssueStatus[];

  const isCreateIdeaActive = status === ISSUE_STATUS.BRAINSTORMING;
  const isVoteActive = VOTE_LIFECYCLE.includes(status);
  const isVoteEnded = VOTE_FINISHED_STATES.includes(status);

  // mysql에서 이슈 상태 가져와서 초기화
  useEffect(() => {
    const initializeIssueStatus = async () => {
      const issue = await getIssue(issueId);
      if (issue) {
        setInitialData({
          id: issueId,
          status: issue.status || ISSUE_STATUS.BRAINSTORMING,
          isQuickIssue: issue.topicId ? true : false,
        });
      }
    };

    const initializeIssueMember = async () => {
      const members = await getIssueMembers(issueId);
      if (!members) return;

      const mappedMembers = members.map((member: IssueMember) => ({
        id: member.id,
        displayName: member.displayName,
        role: member.role,
        isConnected: false, // 초기값
      }));

      setMembers(mappedMembers);
    };

    initializeIssueStatus();
    initializeIssueMember();
  }, [issueId, setInitialData]);

  return {
    status,
    isAIStructuring,
    isCreateIdeaActive,
    isVoteActive,
    isVoteEnded,
  };
}
