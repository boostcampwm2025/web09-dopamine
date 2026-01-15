'use client';

import { useEffect } from 'react';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { ISSUE_STATUS } from '@/constants/issue';
import { getIssue, getIssueMembers } from '@/lib/api/issue';
import { IssueMember } from '@/types/issue';

interface IssueStatusInitializerProps {
  issueId: string;
}

/**
 * Summary 페이지에서 이슈 상태를 초기화하는 컴포넌트
 * 사이드바와 헤더에서 올바른 상태를 표시하기 위해 필요
 */
export default function IssueStatusInitializer({ issueId }: IssueStatusInitializerProps) {
  const { setInitialData, setMembers } = useIssueStore((state) => state.actions);

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

  return null; // 렌더링할 내용 없음
}
