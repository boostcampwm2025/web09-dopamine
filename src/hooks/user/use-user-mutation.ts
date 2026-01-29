import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import { withdraw } from '@/lib/api/auth';

export const useUserMutation = () => {
  const queryClient = useQueryClient();

  const withdrawMutation = useMutation({
    mutationFn: () => withdraw(),
    onSuccess: async () => {
      toast.success('회원탈퇴가 완료되었습니다.');
      queryClient.clear();
      await signOut({ callbackUrl: '/' });
    },
    onError: (error: Error) => {
      console.error('회원탈퇴 에러:', error);
      toast.error(error.message || '회원탈퇴 중 오류가 발생했습니다.');
    },
  });

  return { withdrawMutation };
};
