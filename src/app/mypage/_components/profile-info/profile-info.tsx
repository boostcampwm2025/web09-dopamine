import { User } from 'next-auth';
import TextField from '@/app/mypage/_components/text-field/text-field';
import * as S from './profile-info.styles';

interface ProfileInfoProps {
  user?: User;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {

  return (
    <S.FormContainer>
      <S.ProfileHeader>
        <S.Text>프로필 정보</S.Text>
      </S.ProfileHeader>
      <TextField
        label="이름"
        value={user?.name || ''}
        readOnly
      />
      <TextField
        label="이메일"
        value={user?.email || ''}
        readOnly
      />
    </S.FormContainer>
  );
}
