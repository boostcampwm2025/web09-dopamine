import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { InvitationService } from '@/lib/services/invitation.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return createErrorResponse('UNAUTHORIZED_USER', 401);
    }

    const { token } = await req.json();

    const result = await InvitationService.acceptInvitation(
      token,
      session.user.email,
      session.user.id,
    );

    return createSuccessResponse(result, 201);
  } catch (error: any) {
    return createErrorResponse(error.message ?? 'PROJECT_JOIN_FAILED', 400);
  }
}
