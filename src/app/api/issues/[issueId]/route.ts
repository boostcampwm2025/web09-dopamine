import { NextRequest, NextResponse } from 'next/server';
import { findIssueById, updateIssue } from '@/lib/repositories/issue.repository';
import { getAuthenticatedUserId } from '@/lib/utils/api-auth';
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
    const issue = await updateIssue(issueId, title, userId);
    //TODO: SSE 연결 필요
    return createSuccessResponse(issue);
  } catch (error: unknown) {
    console.error('이슈 수정 실패:', error);
    const errorMessage = error instanceof Error ? error.message : 'ISSUE_UPDATE_FAILED';
    return createErrorResponse(errorMessage, 500);
  }
}
