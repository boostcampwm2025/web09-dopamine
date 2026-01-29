import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { InvitationService } from '@/lib/services/invitation.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;
    const userEmail = session?.user?.email ?? null;

    if (!userId || !userEmail) {
      return createErrorResponse('UNAUTHORIZED_USER', 401);
    }

    const { token } = await req.json();

    const result = await InvitationService.acceptInvitation(token, userEmail, userId);

    return createSuccessResponse(result, 201);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'PROJECT_JOIN_FAILED';
    return createErrorResponse(errorMessage, 400);
  }
}
