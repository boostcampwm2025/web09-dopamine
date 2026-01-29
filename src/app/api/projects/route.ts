import { NextRequest } from 'next/server';
import * as projectRepository from '@/lib/repositories/project.repository';
import { getAuthenticatedUserId } from '@/lib/utils/api-auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const { userId: ownerId, error } = await getAuthenticatedUserId(req);

  if (!ownerId) {
    return error ?? createErrorResponse('UNAUTHORIZED', 401);
  }

  try {
    // 참여중인 프로젝트(소유/게스트 포함) 조회
    const projects = await projectRepository.getProjectsByUserMembership(ownerId);
    return createSuccessResponse(projects, 200);
  } catch (error) {
    console.error('프로젝트 목록 조회 실패:', error);
    return createErrorResponse('PROJECT_LIST_FAILED', 500);
  }
}

export async function POST(req: NextRequest) {
  const { userId: ownerId, error } = await getAuthenticatedUserId(req);

  if (!ownerId) {
    return error ?? createErrorResponse('UNAUTHORIZED', 401);
  }

  const { title, description } = await req.json();

  if (!title) {
    return createErrorResponse('TITLE_REQUIRED', 400);
  }

  try {
    const result = await projectRepository.createProject(title, ownerId, description);
    return createSuccessResponse(result, 201);
  } catch (error) {
    console.error('프로젝트 생성 실패:', error);
    return createErrorResponse('PROJECT_CREATE_FAILED', 500);
  }
}

export async function DELETE(req: NextRequest) {
  const { userId: ownerId, error } = await getAuthenticatedUserId(req);

  if (!ownerId) {
    return error ?? createErrorResponse('UNAUTHORIZED', 401);
  }

  const { id } = await req.json();

  if (!id) {
    return createErrorResponse('ID_REQUIRED', 400);
  }

  try {
    const result = await projectRepository.deleteProject(id, ownerId);
    return createSuccessResponse(result, 200);
  } catch (error) {
    console.error('프로젝트 삭제 실패:', error);
    return createErrorResponse('PROJECT_DELETE_FAILED', 500);
  }
}
