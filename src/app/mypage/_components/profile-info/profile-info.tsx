import { useSession } from 'next-auth/react';
import TextField from '@/app/mypage/_components/text-field/text-field';
import * as S from './profile-info.styles';

export default function ProfileInfo() {
  const { data: session } = useSession();
  const user = session?.user;

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
