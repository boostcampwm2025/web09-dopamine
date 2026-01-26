import { LeaveService } from '@/lib/services/leave.service';
import { getUserIdFromHeader } from '@/lib/utils/api-auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string }> },
) {
  const userId = getUserIdFromHeader(req);

  if (!userId) {
    return createErrorResponse('UNAUTHORIZED', 401);
  }

  try {
    const { projectId } = await params;
    const result = await LeaveService.leaveProject(projectId, userId);

    return createSuccessResponse(result, 200);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'PROJECT_NOT_FOUND') {
        return createErrorResponse('PROJECT_NOT_FOUND', 404);
      }

      if (error.message === 'PROJECT_OWNER_CANNOT_LEAVE') {
        return createErrorResponse('PROJECT_OWNER_CANNOT_LEAVE', 403);
      }

      if (error.message === 'PROJECT_MEMBER_NOT_FOUND') {
        return createErrorResponse('PROJECT_MEMBER_NOT_FOUND', 404);
      }
    }

    return createErrorResponse('LEAVE_PROJECT_FAILED', 500);
  }
}
