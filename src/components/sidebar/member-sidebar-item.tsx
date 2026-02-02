import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useIssueId, useIssueIdentity } from '@/app/(with-sidebar)/issue/hooks';
import { MEMBER_ROLE } from '@/constants/issue';
import * as MemberS from './member-sidebar-item.styles';
import * as S from './sidebar.styles';

interface MemberSidebarItemProps {
  profile?: string;
  id: string;
  name: string;
  role: typeof MEMBER_ROLE.OWNER | typeof MEMBER_ROLE.MEMBER;
  isConnected?: boolean;
}

export default function MemberSidebarItem({
  id,
  name,
  profile,
  role,
  isConnected,
}: MemberSidebarItemProps) {
  const issueId = useIssueId();
  const pathname = usePathname();
  const isIssuePage = pathname?.startsWith('/issue/');
  const validIssueId = isIssuePage ? issueId : undefined;

  const { userId } = useIssueIdentity(validIssueId);

  const isCurrentUser = userId === id;

  const isProjectOwner = role === MEMBER_ROLE.OWNER && profile;
  const isIssueOwner = role === MEMBER_ROLE.OWNER && !profile;

  return (
    <S.SidebarListItem>
      <MemberS.MemberItemButton>
        <MemberS.NameContainer isConnected={isConnected}>
          {isIssueOwner && (
            <Image
              src="/yellow-crown.svg"
              alt="owner"
              width={18}
              height={18}
            />
          )}
          {profile && (
            <Image
              src={profile}
              alt="profile"
              width={24}
              height={24}
              style={{ borderRadius: '50%' }}
            />
          )}
          <span>{name}</span>
          {isCurrentUser && <MemberS.CurrentUserLabel>me</MemberS.CurrentUserLabel>}
          {isProjectOwner && (
            <MemberS.OwnerBadge>
              <Image
                src="/yellow-crown.svg"
                alt="팀장"
                width={14}
                height={14}
              />
              <MemberS.OwnerText>팀장</MemberS.OwnerText>
            </MemberS.OwnerBadge>
          )}
        </MemberS.NameContainer>
        {isConnected !== undefined && <MemberS.StatusLabel isConnected={isConnected} />}
      </MemberS.MemberItemButton>
    </S.SidebarListItem>
  );
}
