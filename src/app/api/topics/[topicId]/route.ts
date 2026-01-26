import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';
import { findTopicById } from '@/lib/repositories/topic.repository';
import * as topicRepository from '@/lib/repositories/topic.repository';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;

  if (!topicId) {
    return createErrorResponse('TOPIC_ID_REQUIRED', 400);
  }

  try {
    const topic = await findTopicById(topicId);

    if (!topic) {
      return createErrorResponse('TOPIC_NOT_FOUND', 404);
    }

    return createSuccessResponse({
      id: topic.id,
      title: topic.title,
      projectId: topic.projectId,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    });
  } catch (error) {
    console.error('토픽 조회 실패:', error);
    return createErrorResponse('TOPIC_FETCH_FAILED', 500);
  }
}
