import { useEffect } from 'react';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { ISSUE_STATUS } from '@/constants/issue';
import { getIssueMembers } from '@/lib/api/issue';
import { IssueMember, IssueStatus } from '@/types/issue';
import { useIssueQuery } from './queries/use-issue-query';

export function useIssueData(issueId: string) {
  const { data: issue } = useIssueQuery(issueId);

  const status = issue?.status as IssueStatus;
  const isQuickIssue = !issue?.topicId;

  const { isAIStructuring } = useIssueStore();
  const { setMembers } = useIssueStore((state) => state.actions);

  const isCreateIdeaActive = status === ISSUE_STATUS.BRAINSTORMING;
  const isVoteButtonVisible = status === ISSUE_STATUS.VOTE || status === ISSUE_STATUS.SELECT;
  const isVoteDisabled = status === ISSUE_STATUS.SELECT;

  useEffect(() => {
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
    initializeIssueMember();
  }, [issueId, setMembers]);

  return {
    status,
    isQuickIssue,
    isAIStructuring,
    isCreateIdeaActive,
    isVoteButtonVisible,
    isVoteDisabled,
  };
}
