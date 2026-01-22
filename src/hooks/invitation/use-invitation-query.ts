import { useQuery } from '@tanstack/react-query';
import { getInvitationInfo } from '@/lib/api/invitation';

export const useInvitationInfo = (code: string | null) => {
  return useQuery({
    queryKey: ['invitation', code],
    queryFn: () => getInvitationInfo(code),
    enabled: !!code, // code가 null이거나 빈 문자열이면 아예 요청을 안 보냄
    retry: 0,
  });
};
