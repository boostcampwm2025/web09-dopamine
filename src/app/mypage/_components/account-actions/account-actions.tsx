import { signOut } from 'next-auth/react';
import { useUserMutation } from '@/hooks/user/use-user-mutation';
import * as S from './account-actions.styles';

export default function AccountActions() {
  const { withdrawMutation } = useUserMutation();

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleWithdraw = () => {
    if (!confirm('정말로 탈퇴하시겠습니까? 탈퇴 시 모든 데이터가 삭제됩니다.')) {
      return;
    }
    withdrawMutation.mutate();
  };

  return (
    <S.Container>
      <S.ActionButton
        variant="logout"
        onClick={handleLogout}
      >
        로그아웃
      </S.ActionButton>
      <S.ActionButton
        variant="delete"
        onClick={handleWithdraw}
      >
        회원탈퇴
      </S.ActionButton>
    </S.Container>
  );
}
