import { NextRequest } from 'next/server';
import * as projectRepository from '@/lib/repositories/project.repository';
import { getUserIdFromHeader } from '@/lib/utils/api-auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  // 인증 확인
  const userId = getUserIdFromHeader(req);

  if (!userId) {
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  // 인증 확인
  const userId = getUserIdFromHeader(req);

  if (!userId) {
    return createErrorResponse('UNAUTHORIZED', 401);
  }

  const { projectId } = await params;
  const { title, description } = await req.json();

  try {
    const project = await projectRepository.updateProject(projectId, title, description);
    return createSuccessResponse(project, 200);
  } catch (error) {
    console.error('프로젝트 수정 실패:', error);
    return createErrorResponse('PROJECT_UPDATE_FAILED', 500);
  }
}
