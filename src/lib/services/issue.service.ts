import { findIssueWithPermissionData, updateIssue } from '../repositories/issue.repository';

interface updateIssueProps {
  issueId: string;
  title: string;
  userId: string;
}

export const issueService = {
  async updateIssue({ issueId, title, userId }: updateIssueProps) {
    const issue = await findIssueWithPermissionData(issueId, userId);

    if (!issue) throw new Error('ISSUE_NOT_FOUND');

    const isQuickIssue = !issue.topicId;
    const isOwner = issue.issueMembers.length > 0;
    const projectMembers = issue.topic?.project?.projectMembers || [];
    const isProjectMember = projectMembers.length > 0;

    const hasPermission = isQuickIssue ? isOwner : isProjectMember;

    if (!hasPermission) {
      throw new Error('PERMISSION_DENIED');
    }

    return await updateIssue(issueId, title);
  },
};
