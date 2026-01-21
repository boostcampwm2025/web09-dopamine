import { InvitationRepository } from '@/lib/repositories/invitation.repository';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const { emails } = await req.json();

    const token = crypto.randomUUID();

    const newInvitation = await InvitationRepository.createInvitation(
      params.projectId,
      token,
      emails,
    );

    return createSuccessResponse(newInvitation, 201);
  } catch (error) {
    return createErrorResponse('INVITATION_TOKEN_CREATE_FAILED', 500);
  }
}
