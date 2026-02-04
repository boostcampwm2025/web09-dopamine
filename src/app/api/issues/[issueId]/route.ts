import { NextRequest, NextResponse } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { findIssueById } from '@/lib/repositories/issue.repository';
import { issueService } from '@/lib/services/issue.service';
import { broadcast, broadcastToTopic } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string }> },
): Promise<NextResponse> {
  const { issueId: id } = await params;

  try {
    const issue = await findIssueById(id);

    if (!issue) {
      return createErrorResponse('ISSUE_NOT_FOUND', 404);
    }

    return createSuccessResponse(issue);
  } catch (error) {
    console.error('이슈 조회 실패:', error);
    return createErrorResponse('ISSUE_FETCH_FAILED', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string }> },
): Promise<NextResponse> {
  const { issueId } = await params;
  const { title, userId } = await req.json();
  const actorConnectionId = req.headers.get('x-sse-connection-id') || undefined;

  try {
    const issue = await issueService.updateIssueTitle({ issueId, title, userId });

    broadcast({
      issueId: issueId,
      excludeConnectionId: actorConnectionId,
      event: {
        type: SSE_EVENT_TYPES.ISSUE_STATUS_CHANGED,
        data: { title: issue.title, issueId, topicId: issue?.topicId },
      },
    });

    if (issue?.topicId) {
      broadcastToTopic({
        topicId: issue.topicId,
        event: {
          type: SSE_EVENT_TYPES.ISSUE_STATUS_CHANGED,
          data: { title: issue.title, issueId, topicId: issue.topicId },
        },
      });
    }

    return createSuccessResponse(issue);
  } catch (error: unknown) {
    console.error('이슈 수정 실패:', error);
    if (error instanceof Error) {
      if (error.message === 'ISSUE_NOT_FOUND') {
        return createErrorResponse('ISSUE_NOT_FOUND', 404);
      }
      if (error.message === 'PERMISSION_DENIED') {
        return createErrorResponse('PERMISSION_DENIED', 403);
      }
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('ISSUE_UPDATE_FAILED', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string }> },
) {
  const { issueId } = await params;
  const actorConnectionId = req.headers.get('x-sse-connection-id') || undefined;

  try {
    const { userId } = await req.json();

    const issue = await issueService.deleteIssue(issueId, userId);

    broadcast({
      issueId,
      excludeConnectionId: actorConnectionId,
      event: {
        type: SSE_EVENT_TYPES.ISSUE_DELETED,
        data: { issueId, topicId: issue?.topicId },
      },
    });

    // 토픽 맵을 보고 있는 유저들에게 브로드캐스트 (노드 제거)
    if (issue?.topicId) {
      broadcastToTopic({
        topicId: issue.topicId,
        excludeConnectionId: actorConnectionId,
        event: {
          type: SSE_EVENT_TYPES.ISSUE_DELETED,
          data: { issueId, topicId: issue.topicId, actorId: userId },
        },
      });
    }

    return createSuccessResponse(issue);
  } catch (error: unknown) {
    console.error('이슈 삭제 실패:', error);

    if (error instanceof Error) {
      if (error.message === 'ISSUE_NOT_FOUND') {
        return createErrorResponse('ISSUE_NOT_FOUND', 404);
      }
      if (error.message === 'PERMISSION_DENIED') {
        return createErrorResponse('PERMISSION_DENIED', 403);
      }
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('ISSUE_DELETE_FAILED', 500);
  }
}
