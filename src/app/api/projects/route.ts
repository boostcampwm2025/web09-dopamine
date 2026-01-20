import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as projectRepository from '@/lib/repositories/project.repository';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  // 서버 세션에서 인증된 사용자 정보를 가져옴
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return createErrorResponse('UNAUTHORIZED', 401);
  }

  const ownerId = session.user.id;

  try {
    const projects = await projectRepository.getProjectsByOwnerId(ownerId);
    return createSuccessResponse(projects, 200);
  } catch (error) {
    console.error('프로젝트 목록 조회 실패:', error);
    return createErrorResponse('PROJECT_LIST_FAILED', 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return createErrorResponse('UNAUTHORIZED', 401);
  }

  const { title } = await req.json();
  const ownerId = session.user.id;

  if (!title) {
    return createErrorResponse('TITLE_REQUIRED', 400);
  }

  try {
    const result = await projectRepository.createProject(title, ownerId);
    return createSuccessResponse(result, 201);
  } catch (error) {
    console.error('프로젝트 생성 실패:', error);
    return createErrorResponse('PROJECT_CREATE_FAILED', 500);
  }
}
