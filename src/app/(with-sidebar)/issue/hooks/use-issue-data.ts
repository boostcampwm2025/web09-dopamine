import { useEffect } from 'react';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { ISSUE_STATUS } from '@/constants/issue';
import { getIssue, getIssueMembers } from '@/lib/api/issue';
import { IssueMember, IssueStatus } from '@/types/issue';

export function useIssueData(issueId: string) {
  const { status, isAIStructuring } = useIssueStore();
  const { setInitialData, setMembers } = useIssueStore((state) => state.actions);

  const isCreateIdeaActive = status === ISSUE_STATUS.BRAINSTORMING;
  const isVoteButtonVisible = status === ISSUE_STATUS.VOTE || status === ISSUE_STATUS.SELECT;
  const isVoteDisabled = status === ISSUE_STATUS.SELECT;

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
        isConnected: member.isConnected,
      }));

      setMembers(mappedMembers);
    };

    initializeIssueStatus();
    initializeIssueMember();
  }, [issueId, setInitialData, setMembers]);

  return {
    status,
    isAIStructuring,
    isCreateIdeaActive,
    isVoteButtonVisible,
    isVoteDisabled,
  };
}
