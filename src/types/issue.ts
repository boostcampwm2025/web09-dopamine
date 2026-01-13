import { ISSUE_STATUS, MEMBER_ROLE } from '@/constants/issue';

export type IssueStatus = (typeof ISSUE_STATUS)[keyof typeof ISSUE_STATUS];

type MemberRole = (typeof MEMBER_ROLE)[keyof typeof MEMBER_ROLE];

export type IssueMember = {
  id: string;
  displayName: string;
  role: MemberRole;
  isConnected: boolean;
};
