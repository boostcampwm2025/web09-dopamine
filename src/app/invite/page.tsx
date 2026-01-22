'use client';

import { Suspense } from 'react';
import LoadingOverlay from '@/components/loading-overlay/loading-overlay';
import { InvitationContainer } from './invitation-container';

export default function Page() {
  return (
    <Suspense fallback={<LoadingOverlay message="페이지 로딩 중.." />}>
      <InvitationContainer />
    </Suspense>
  );
}
