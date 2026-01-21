import { ISSUE_STATUS, MEMBER_ROLE } from '@/constants/issue';

export type IssueStatus = (typeof ISSUE_STATUS)[keyof typeof ISSUE_STATUS];

type MemberRole = (typeof MEMBER_ROLE)[keyof typeof MEMBER_ROLE];

export type IssueMember = {
  id: string;
  displayName: string;
  role: MemberRole;
  isConnected: boolean;
};

// 완전한 Issue 타입 (DB 스키마 기반)
export type Issue = {
  id: string;
  topicId: string | null;
  title: string;
  status: string;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

// 특정 용도에 맞는 Issue 타입들
export type IssueMapData = Pick<Issue, 'id' | 'title' | 'status' | 'createdAt' | 'updatedAt'>;

export type IssueNode = {
  id: string;
  issueId: string;
  positionX: number;
  positionY: number;
};

export type IssueConnection = {
  id: string;
  issueAId: string;
  issueBId: string;
  sourceHandle: string | null;
  targetHandle: string | null;
};
