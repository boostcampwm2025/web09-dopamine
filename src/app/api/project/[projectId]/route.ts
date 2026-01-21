import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';
import * as projectRepository from '@/lib/repositories/project.repository';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  // 인증 확인
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return createErrorResponse('UNAUTHORIZED', 401);
  }

  const { projectId } = await params;

  try {
    const project = await projectRepository.getProjectWithTopics(projectId);

    if (!project) {
      return createErrorResponse('PROJECT_NOT_FOUND', 404);
    }

    return createSuccessResponse(project, 200);
  } catch (error) {
    console.error('프로젝트 조회 실패:', error);
    return createErrorResponse('PROJECT_FETCH_FAILED', 500);
  }
}
