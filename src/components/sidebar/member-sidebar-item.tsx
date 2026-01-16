import Image from 'next/image';
import { useIssueId } from '@/app/(with-sidebar)/issue/hooks/use-issue-id';
import { MEMBER_ROLE } from '@/constants/issue';
import { getUserIdForIssue } from '@/lib/storage/issue-user-storage';
import * as MemberS from './member-sidebar-item.styles';
import * as S from './sidebar.styles';

interface MemberSidebarItemProps {
  id: string;
  name: string;
  role: typeof MEMBER_ROLE.OWNER | typeof MEMBER_ROLE.MEMBER;
  isConnected: boolean;
}

export default function MemberSidebarItem({ id, name, role, isConnected }: MemberSidebarItemProps) {
  const issueId = useIssueId();
  const currentUserId = getUserIdForIssue(issueId);
  const isCurrentUser = currentUserId === id;

  return (
    <S.SidebarListItem>
      <MemberS.MemberItemButton>
        <MemberS.NameContainer isConnected={isConnected}>
          {role === MEMBER_ROLE.OWNER && (
            <Image
              src="/yellow-crown.svg"
              alt="owner"
              width={18}
              height={18}
            />
          )}
          <span>{name}</span>
          {isCurrentUser && <MemberS.CurrentUserLabel>me</MemberS.CurrentUserLabel>}
        </MemberS.NameContainer>
        <MemberS.StatusLabel isConnected={isConnected} />
      </MemberS.MemberItemButton>
    </S.SidebarListItem>
  );
}
