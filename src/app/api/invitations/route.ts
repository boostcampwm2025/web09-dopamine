import { InvitationService } from '@/lib/services/invitation.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return createErrorResponse('CODE_REQUIRED', 400);
    }

    const invitation = await InvitationService.getInvitationInfo(code);

    if (!invitation) {
      return createErrorResponse('INVITATION_NOT_FOUND', 404);
    }

    return createSuccessResponse(invitation, 200);
  } catch (err: any) {
    return createErrorResponse(err.message, 400);
  }
}
