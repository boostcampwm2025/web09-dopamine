import type { Metadata } from 'next';
import { InvitationService } from '@/lib/services/invitation.service';
import { InvitationContainer } from './invitation-container';

export const metadata: Metadata = {
  title: 'Murphy | 프로젝트 초대',
  description: 'Murphy 프로젝트 초대 링크입니다. 링크를 통해 참여해보세요',
};

export default async function Page({ searchParams }: { searchParams: Promise<{ code: string }> }) {
  const { code } = await searchParams;

  if (!code || typeof code !== 'string') {
    throw new Error('CODE_REQUIRED');
  }

  const invitationData = await InvitationService.getInvitationInfo(code);

  return (
    <InvitationContainer
      data={invitationData}
      code={code}
    />
  );
}
