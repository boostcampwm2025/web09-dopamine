import Image from 'next/image';
import { useIssueId, useIssueIdentity } from '@/app/(with-sidebar)/issue/hooks';
import { MEMBER_ROLE } from '@/constants/issue';
import { useMemberNicknameEdit } from './use-member-nickname-edit';
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
  const { userId } = useIssueIdentity(issueId);
  const isCurrentUser = userId === id;
  const isProjectOwner = role === MEMBER_ROLE.OWNER && profile;
  const isIssueOwner = role === MEMBER_ROLE.OWNER && !profile;

  const {
    isEditing,
    editName,
    setEditName,
    startEditing,
    cancelEditing,
    saveEditing,
    handleKeyDown,
  } = useMemberNicknameEdit({
    issueId,
    userId: id,
    initialName: name,
  });

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

          {isEditing ? (
            <MemberS.EditInput
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
              onBlur={() => cancelEditing()}
              autoFocus
            />
          ) : (
            <span>{name}</span>
          )}

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

          {isCurrentUser && (
            <MemberS.ActionContainer>
              {isEditing ? (
                <>
                  <MemberS.IconButton
                    onClick={saveEditing}
                    onMouseDown={(e) => e.preventDefault()}
                    title="저장"
                  >
                    저장
                  </MemberS.IconButton>
                </>
              ) : (
                <MemberS.IconButton onClick={startEditing} title="닉네임 수정">
                  <Image
                    src="/edit.svg"
                    alt="닉네임 수정"
                    width={14}
                    height={14}
                  />
                </MemberS.IconButton>
              )}
            </MemberS.ActionContainer>
          )}

        </MemberS.NameContainer>
        {isConnected !== undefined && <MemberS.StatusLabel isConnected={isConnected} />}
      </MemberS.MemberItemButton>
    </S.SidebarListItem>
  );
}
