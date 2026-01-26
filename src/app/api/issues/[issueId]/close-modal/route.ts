import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { MEMBER_ROLE } from '@/constants/issue';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { authOptions } from '@/lib/auth';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { findIssueById } from '@/lib/repositories/issue.repository';
import { broadcast } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';
import { getUserIdFromRequest } from '@/lib/utils/cookie';

/**
 * 방장 권한 인증/인가 헬퍼
 * - Issue 조회
 * - userId 추출 및 로그인 확인 (OAuth 세션 or 쿠키)
 * - 방장 권한 확인
 */
async function authorizeOwner(
  req: NextRequest,
  issueId: string,
): Promise<{ error: NextResponse } | { issueId: string }> {
  const issue = await findIssueById(issueId);
  if (!issue) {
    return { error: createErrorResponse('ISSUE_NOT_FOUND', 404) };
  }

  let userId;
  if (issue.topicId) {
    const session = await getServerSession(authOptions);
    userId = session?.user?.id;
  } else {
    userId = getUserIdFromRequest(req, issueId);
  }

  if (!userId) {
    return { error: createErrorResponse('USER_ID_REQUIRED', 401) };
  }

  const member = await issueMemberRepository.findMemberByUserId(issueId, userId);
  if (!member || member.role !== MEMBER_ROLE.OWNER) {
    return { error: createErrorResponse('OWNER_PERMISSION_REQUIRED', 403) };
  }

  return { issueId };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;

  const result = await authorizeOwner(req, issueId);
  if ('error' in result) return result.error;

  broadcast({
    issueId,
    event: {
      type: SSE_EVENT_TYPES.CLOSE_MODAL_OPENED,
      data: {},
    },
  });

  return createSuccessResponse({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string }> },
): Promise<NextResponse> {
  const { issueId } = await params;

  const result = await authorizeOwner(req, issueId);
  if ('error' in result) return result.error;

  broadcast({
    issueId,
    event: {
      type: SSE_EVENT_TYPES.CLOSE_MODAL_CLOSED,
      data: {},
    },
  });

  return createSuccessResponse({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string }> },
): Promise<NextResponse> {
  const { issueId } = await params;
  const { memo } = await req.json();

  const result = await authorizeOwner(req, issueId);
  if ('error' in result) return result.error;

  broadcast({
    issueId,
    event: {
      type: SSE_EVENT_TYPES.CLOSE_MODAL_MEMO_UPDATED,
      data: { memo: memo || '' },
    },
  });

  return createSuccessResponse({ success: true });
}
