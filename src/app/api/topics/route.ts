import { NextRequest } from 'next/server';
import * as topicRepository from '@/lib/repositories/topic.repository';
import { getUserIdFromHeader } from '@/lib/utils/api-auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest) {
  const userId = getUserIdFromHeader(req);

  if (!userId) {
    return createErrorResponse('UNAUTHORIZED', 401);
  }

  const { title, projectId } = await req.json();

  if (!title) {
    return createErrorResponse('TITLE_REQUIRED', 400);
  }

  if (!projectId) {
    return createErrorResponse('PROJECT_ID_REQUIRED', 400);
  }

  try {
    const result = await topicRepository.createTopic(title, projectId);
    return createSuccessResponse(result, 201);
  } catch (error) {
    console.error('토픽 생성 실패:', error);
    return createErrorResponse('TOPIC_CREATE_FAILED', 500);
  }
}
