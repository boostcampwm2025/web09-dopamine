import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteUser } from '@/lib/repositories/user.repository';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse('UNAUTHORIZED', 401);
    }

    const userId = session.user.id;

    await deleteUser(userId);

    return createSuccessResponse({ message: '회원탈퇴가 완료되었습니다.' });
  } catch (error) {
    console.error('회원탈퇴 에러:', error);
    return createErrorResponse('INTERNAL_SERVER_ERROR', 500);
  }
}

