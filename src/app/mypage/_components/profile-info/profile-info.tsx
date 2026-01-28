import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User } from 'next-auth';
import TextField from '@/app/mypage/_components/text-field/text-field';
import * as S from './profile-info.styles';
import { useUserMutation } from '@/hooks/user/use-user-mutation';
import toast from 'react-hot-toast';

interface ProfileInfoProps {
  user?: User & {
    displayName?: string;
  };
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  const { update } = useSession();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const { updateDisplayNameMutation } = useUserMutation();

  useEffect(() => {
    setDisplayName(user?.displayName || '');
  }, [user?.displayName]);

  const handleDisplayNameChange = (value: string) => {
    if (value.length > 30) {
      toast.error('보여질 이름은 30자 이하여야 합니다.');
      return;
    }
    setDisplayName(value);
  };

  const handleUpdateDisplayName = () => {
    if (!displayName || displayName === user?.displayName) return;

    updateDisplayNameMutation.mutate(displayName, {
      onSuccess: async () => {
        await update({ displayName });
      },
    });
  };

  return (
    <S.FormContainer>
      <S.ProfileHeader>
        <S.Text>프로필 정보</S.Text>
      </S.ProfileHeader>
      <TextField
        label='보여질 이름'
        value={displayName}
        onChange={handleDisplayNameChange}
        onEnter={handleUpdateDisplayName}
        description='팀원들에게 표시되는 이름입니다.'
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        }
        onIconClick={handleUpdateDisplayName}
      />
      <TextField
        label="계정이름"
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
