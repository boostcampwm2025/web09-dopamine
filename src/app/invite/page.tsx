import { InvitationService } from '@/lib/services/invitation.service';
import { InvitationContainer } from './invitation-container';

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
