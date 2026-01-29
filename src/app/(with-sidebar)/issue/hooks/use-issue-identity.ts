import { useSession } from 'next-auth/react';
import { DEFAULT_SELF_LABEL } from '@/constants/issue';
import { getUserIdForIssue } from '@/lib/storage/issue-user-storage';
import type { IssueMember } from '@/types/issue';
import { useIssueQuery } from '@/hooks/issue';

interface UseIssueIdentityOptions {
  enabled?: boolean;
  isQuickIssue?: boolean;
  members?: IssueMember[];
}

export function useIssueIdentity(issueId: string, options: UseIssueIdentityOptions = {}) {
  const { data: session } = useSession(); // 현재 로그인한 사용자 세션
  const issueUserId = getUserIdForIssue(issueId) ?? ''; // 이슈에 연결된 사용자 ID(익명용)

  // isQuickIssue 옵션이 명시되지 않은 경우, 이슈 데이터를 통해 판단
  const shouldFetchIssue = options.isQuickIssue === undefined;

  // 이슈 데이터 조회(필요시)
  const { data: issue } = useIssueQuery(issueId, (options.enabled ?? true) && shouldFetchIssue);

  // 최종 isQuickIssue 결정
  const isQuickIssue = options.isQuickIssue ?? !issue?.topicId;
  const sessionUserId = session?.user?.id ?? '';
  const userId = isQuickIssue ? issueUserId : sessionUserId || issueUserId;

  const members = options.members ?? [];
  const currentMember = members.find((member) => member.id === userId);
  const nickname = isQuickIssue
    ? currentMember?.nickname || DEFAULT_SELF_LABEL
    : session?.user?.name || currentMember?.nickname || DEFAULT_SELF_LABEL;

  return {
    userId, // 이슈에 연결된 사용자 ID
    nickname, // 노출될 이름
    issueUserId, // 익명 이슈용 사용자 ID
    sessionUserId, // 로그인한 사용자 ID
    isQuickIssue, // 익명 이슈 여부
  };
}
