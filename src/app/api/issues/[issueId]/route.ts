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

  try {
    const issue = await issueService.updateIssueTitle({ issueId, title, userId });

    broadcast({
      issueId: issueId,
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
