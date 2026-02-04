import Image from 'next/image';
import { MEMBER_ROLE } from '@/constants/issue';
import { useMemberNicknameEdit } from './use-member-nickname-edit';
import * as MemberS from './member-sidebar-item.styles';
import * as S from './sidebar.styles';
import { StringifyOptions } from 'querystring';

interface MemberSidebarItemProps {
  profile?: string;
  id: string;
  name: string;
  role: typeof MEMBER_ROLE.OWNER | typeof MEMBER_ROLE.MEMBER;
  isConnected?: boolean;
  currentUserId?: string;
  issueId?: string;
}

export default function MemberSidebarItem({
  id,
  name,
  profile,
  role,
  isConnected,
  currentUserId,
  issueId,
}: MemberSidebarItemProps) {
  const isCurrentUser = currentUserId === id;

  // 이슈 페이지 여부
  const isIssuePage = !!issueId;

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

          {!isIssuePage && isCurrentUser && (
            <MemberS.CurrentUserLabel>me</MemberS.CurrentUserLabel>
          )}

          {isCurrentUser && isIssuePage && (
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
                    src="/edit-gray.svg"
                    alt="닉네임 수정"
                    width={14}
                    height={14}
                  />
                </MemberS.IconButton>
              )}
            </MemberS.ActionContainer>
          )}

          {(isProjectOwner && !isEditing) && (
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
