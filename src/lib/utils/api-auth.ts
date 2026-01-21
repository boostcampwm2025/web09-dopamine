import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse } from '@/lib/utils/api-helpers';

export async function getAuthenticatedUserId() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { 
      userId: null, 
      error: createErrorResponse('UNAUTHORIZED', 401) 
    };
  }

  return { 
    userId: session.user.id, 
    error: null 
  };
}
