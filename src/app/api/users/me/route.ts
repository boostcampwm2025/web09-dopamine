import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateUser } from '@/lib/repositories/user.repository';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-helpers';

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse('UNAUTHORIZED', 401);
    }

    const body = await request.json();
    const { displayName } = body;

    if (typeof displayName !== 'string' || displayName.length > 30) {
      return createErrorResponse('BAD_REQUEST', 400, 'Invalid displayName');
    }

    const user = await updateUser(session.user.id, { displayName });

    return createSuccessResponse(user);
  } catch (error) {
    console.error('Update user error:', error);
    return createErrorResponse('INTERNAL_SERVER_ERROR', 500);
  }
}
