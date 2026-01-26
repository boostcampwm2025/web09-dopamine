import { NextRequest } from 'next/server';
import { findTopicById } from '@/lib/repositories/topic.repository';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

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
