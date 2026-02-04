import { NextRequest } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { findTopicById } from '@/lib/repositories/topic.repository';
import { topicService } from '@/lib/services/topic.service';
import { broadcastToTopic } from '@/lib/sse/sse-service';
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const { topicId } = await params;

  try {
    const { title, userId } = await req.json();

    const topic = await topicService.updateTopicTitle({
      topicId,
      title,
      userId,
    });

    return createSuccessResponse(topic);
  } catch (error: unknown) {
    console.error('토픽 수정 실패:', error);

    if (error instanceof Error) {
      if (error.message === 'TOPIC_NOT_FOUND') {
        return createErrorResponse('TOPIC_NOT_FOUND', 404);
      }
      if (error.message === 'PERMISSION_DENIED') {
        return createErrorResponse('PERMISSION_DENIED', 403);
      }
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('TOPIC_UPDATE_FAILED', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const { topicId } = await params;
  const actorConnectionId = req.headers.get('x-sse-connection-id') || undefined;

  try {
    const topic = await topicService.deleteTopic(topicId);

    broadcastToTopic({
      topicId,
      excludeConnectionId: actorConnectionId,
      event: {
        type: SSE_EVENT_TYPES.TOPIC_DELETED,
        data: { topicId, projectId: topic.projectId },
      },
    });

    return createSuccessResponse(topic);
  } catch (error: unknown) {
    console.error('토픽 삭제 실패:', error);

    if (error instanceof Error) {
      if (error.message === 'TOPIC_NOT_FOUND') {
        return createErrorResponse('TOPIC_NOT_FOUND', 404);
      }
      if (error.message === 'PERMISSION_DENIED') {
        return createErrorResponse('PERMISSION_DENIED', 403);
      }
      if (error.message === 'UNAUTHORIZED') {
        return createErrorResponse('UNAUTHORIZED', 401);
      }
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('TOPIC_DELETE_FAILED', 500);
  }
}
