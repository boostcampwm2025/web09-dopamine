import {
  findIssueWithPermissionData,
  softDeleteIssue,
  updateIssueTitle,
} from '../repositories/issue.repository';

interface updateIssueTitleProps {
  issueId: string;
  title: string;
  userId: string;
}

export const issueService = {
  async updateIssueTitle({ issueId, title, userId }: updateIssueTitleProps) {
    const issue = await findIssueWithPermissionData(issueId, userId);

    if (!issue) throw new Error('ISSUE_NOT_FOUND');

    const isQuickIssue = !issue.topicId;
    const isOwner = issue.issueMembers.length > 0;
    const isProjectMember = (issue.topic?.project?.projectMembers?.length ?? 0) > 0;

    const hasPermission = isQuickIssue ? isOwner : isProjectMember;

    if (!hasPermission) {
      throw new Error('PERMISSION_DENIED');
    }

    return await updateIssueTitle(issueId, title);
  },

  async deleteIssue(issueId: string, userId: string) {
    const issue = await findIssueWithPermissionData(issueId, userId);

    if (!issue) {
      throw new Error('ISSUE_NOT_FOUND');
    }

    const isQuickIssue = !issue.topicId;
    const isOwner = issue.issueMembers.length > 0;
    const isProjectMember = (issue.topic?.project?.projectMembers?.length ?? 0) > 0;

    const hasPermission = isQuickIssue ? isOwner : isProjectMember;

    if (!hasPermission) {
      throw new Error('PERMISSION_DENIED');
    }

    return await softDeleteIssue(issueId);
  },
};
