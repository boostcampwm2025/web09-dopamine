import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { acceptInvitation, createInvitation } from '@/lib/api/invitation';

export const useInvitationMutations = (projectId: string) => {
  const createToken = useMutation({
    mutationFn: (emails: string[]) => createInvitation(projectId, emails),

    onError: (err) => {
      toast.error('초대 링크를 생성할 수 없습니다.');
    },
  });

  const joinProject = useMutation({
    mutationFn: (token: string) => acceptInvitation(projectId, token),

    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { createToken, joinProject };
};
