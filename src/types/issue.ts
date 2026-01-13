import { ISSUE_STATUS } from '@/constants/issue';

export type IssueStatus = (typeof ISSUE_STATUS)[keyof typeof ISSUE_STATUS];

type MemberRole = 'OWNER' | 'MEMBER';

export type IssueMember = {
  id: string;
  displayName: string;
  role: MemberRole;
  isConnected: boolean;
};
