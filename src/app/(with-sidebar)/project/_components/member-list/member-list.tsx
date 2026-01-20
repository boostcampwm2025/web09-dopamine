import Image from 'next/image';
import * as S from './member-list.styles';

interface Member {
  id: number;
  name: string;
  profileImage?: string;
  isOwner?: boolean;
}

interface MemberListProps {
  members: Member[];
}

const MemberList = ({ members }: MemberListProps) => {
  return (
    <S.MemberListContainer>
      {members.map((member) => (
        <S.MemberItem key={member.id}>
          <S.ProfileImageWrapper>
            <Image
              src={member.profileImage || '/profile.svg'}
              alt={`${member.name} 프로필`}
              width={36}
              height={36}
            />
          </S.ProfileImageWrapper>
          <S.MemberInfo>
            <S.MemberName>{member.name}</S.MemberName>
            {member.isOwner && (
              <S.OwnerBadge>
                <Image
                  src="/yellow-crown.svg"
                  alt="팀장"
                  width={14}
                  height={14}
                />
                <S.OwnerText>팀장</S.OwnerText>
              </S.OwnerBadge>
            )}
          </S.MemberInfo>
        </S.MemberItem>
      ))}
    </S.MemberListContainer>
  );
};

export default MemberList;
