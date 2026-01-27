import { findUserById } from '@/lib/repositories/user.repository';
import { InvitationService } from '@/lib/services/invitation.service';
import { getUserIdFromHeader } from '@/lib/utils/api-auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const userId = getUserIdFromHeader(req)!;

    const user = await findUserById(userId);

    if (!user?.email) {
      return createErrorResponse('UNAUTHORIZED_USER', 401);
    }

    const { token } = await req.json();

    const result = await InvitationService.acceptInvitation(token, user.email, userId);

    return createSuccessResponse(result, 201);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'PROJECT_JOIN_FAILED';
    return createErrorResponse(errorMessage, 400);
  }
}
