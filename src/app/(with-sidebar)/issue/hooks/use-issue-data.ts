import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { ISSUE_STATUS } from '@/constants/issue';
import { IssueStatus } from '@/types/issue';
import { useIssueMemberQuery } from './react-query/use-issue-member-query';
import { useIssueQuery } from './react-query/use-issue-query';

export function useIssueData(issueId: string, enabled: boolean = true) {
  const { data: issue, isError: isIssueError } = useIssueQuery(issueId, enabled);
  const { data: members = [], isError: isMembersError } = useIssueMemberQuery(issueId, enabled);

  const status = issue?.status as IssueStatus;
  const isQuickIssue = !issue?.topicId;

  const { isAIStructuring } = useIssueStore();

  const isCreateIdeaActive = status === ISSUE_STATUS.BRAINSTORMING;
  const isVoteButtonVisible = status === ISSUE_STATUS.VOTE || status === ISSUE_STATUS.SELECT;
  const isVoteDisabled = status === ISSUE_STATUS.SELECT;

  return {
    isIssueError: isIssueError || isMembersError,
    status,
    members,
    isQuickIssue,
    isAIStructuring,
    isCreateIdeaActive,
    isVoteButtonVisible,
    isVoteDisabled,
  };
}
