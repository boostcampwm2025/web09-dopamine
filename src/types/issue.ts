import { ISSUE_STATUS } from '@/constants/issue';

export type IssueStatus = (typeof ISSUE_STATUS)[keyof typeof ISSUE_STATUS];
