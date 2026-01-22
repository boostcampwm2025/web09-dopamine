import { InvitationService } from '@/lib/services/invitation.service';
import { InvitationContainer } from './invitation-container';

export default async function Page({ searchParams }: { searchParams: Promise<{ code: string }> }) {
  const { code } = await searchParams;

  if (!code || typeof code !== 'string') {
    throw new Error('초대 코드가 없는 잘못된 접근입니다.');
  }

  const invitationData = await InvitationService.getInvitationInfo(code);

  return <InvitationContainer data={invitationData} />;
}
