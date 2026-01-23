'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CLIENT_ERROR_MESSAGES } from '@/constants/error-messages';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    toast.error(CLIENT_ERROR_MESSAGES[error.message] || '유효하지 않은 초대장입니다.');

    router.replace('/');
  }, [error, router]);
}
