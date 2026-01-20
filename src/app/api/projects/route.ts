import { NextRequest } from 'next/server';
import * as projectRepository from '@/lib/repositories/project.repository';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';
import { getAuthenticatedUserId } from '@/lib/utils/api-auth';

export async function GET() {
  const { userId: ownerId, error } = await getAuthenticatedUserId();

  if (error) {
    return error;
  }

  try {
    const projects = await projectRepository.getProjectsByOwnerId(ownerId!);
    return createSuccessResponse(projects, 200);
  } catch (error) {
    console.error('프로젝트 목록 조회 실패:', error);
    return createErrorResponse('PROJECT_LIST_FAILED', 500);
  }
}

export async function POST(req: NextRequest) {
  const { userId: ownerId, error } = await getAuthenticatedUserId();

  if (error) {
    return error;
  }

  const { title } = await req.json();

  if (!title) {
    return createErrorResponse('TITLE_REQUIRED', 400);
  }

  try {
    const result = await projectRepository.createProject(title, ownerId!);
    return createSuccessResponse(result, 201);
  } catch (error) {
    console.error('프로젝트 생성 실패:', error);
    return createErrorResponse('PROJECT_CREATE_FAILED', 500);
  }
}
