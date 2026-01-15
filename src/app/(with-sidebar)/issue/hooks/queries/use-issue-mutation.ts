import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createQuickIssue } from '@/lib/api/issue';
import { setUserIdForIssue } from '@/lib/storage/issue-user-storage';

export const useQuickStartMutation = (closeModal: () => void) => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { title: string; nickname: string }) =>
      createQuickIssue(data.title, data.nickname),

    onSuccess: (newIssue) => {
      // 이슈별로 userId 저장
      setUserIdForIssue(newIssue.issueId, newIssue.userId);
      closeModal();
      router.push(`/issue/${newIssue.issueId}`);
    },

    onError: (error) => {
      console.error(error);
      toast.error('이슈 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    },
  });
};
