'use client';

import { useEffect } from 'react';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import { getIssueMembers } from '@/lib/api/issue';
import { IssueMember } from '@/types/issue';

interface IssueStatusInitializerProps {
  issueId: string;
}

/**
 * Summary 페이지에서 이슈 상태를 초기화하는 컴포넌트
 * 사이드바와 헤더에서 올바른 상태를 표시하기 위해 필요
 */
export default function IssueStatusInitializer({ issueId }: IssueStatusInitializerProps) {
  const { setMembers } = useIssueStore((state) => state.actions);

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

  return null; // 렌더링할 내용 없음
}
