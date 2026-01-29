import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateUser } from '@/lib/repositories/user.repository';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-helpers';
import { CLIENT_ERROR_MESSAGES } from '@/constants/error-messages';

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse('UNAUTHORIZED', 401);
    }

    const body = await request.json();
    const { displayName } = body;

    const normalized = typeof displayName === 'string' ? displayName.trim() : '';

    if (normalized.length < 1 || normalized.length > 10) {
      return createErrorResponse('BAD_REQUEST', 400, CLIENT_ERROR_MESSAGES.INVALID_DISPLAYNAME);
    }

    const user = await updateUser(session.user.id, { displayName: normalized });

    return createSuccessResponse(user);
  } catch (error) {
    console.error('Update user error:', error);
    return createErrorResponse('INTERNAL_SERVER_ERROR', 500);
  }
}
