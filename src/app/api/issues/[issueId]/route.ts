import { NextRequest, NextResponse } from 'next/server';
import { findIssueById } from '@/lib/repositories/issue.repository';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

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
