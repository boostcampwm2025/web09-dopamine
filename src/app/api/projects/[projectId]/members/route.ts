import { InvitationService } from '@/lib/services/invitation.service';
import { prisma } from '@/lib/prisma';
import { getUserIdFromHeader } from '@/lib/utils/api-auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const userId = getUserIdFromHeader(req)!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user?.email) {
      return createErrorResponse('UNAUTHORIZED_USER', 401);
    }

    const { token } = await req.json();

    const result = await InvitationService.acceptInvitation(token, user.email, userId);

    return createSuccessResponse(result, 201);
  } catch (error: any) {
    return createErrorResponse(error.message ?? 'PROJECT_JOIN_FAILED', 400);
  }
}
