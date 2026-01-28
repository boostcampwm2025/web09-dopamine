import { NextRequest, NextResponse } from 'next/server';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string; userId: string }> },
): Promise<NextResponse> {
  const { issueId, userId } = await params;

  try {
    const member = await issueMemberRepository.findMemberByUserId(issueId, userId);

    if (!member) {
      return createErrorResponse('MEMBER_NOT_FOUND', 404);
    }

    return createSuccessResponse({
      id: member.userId,
      nickname: member.nickname,
      role: member.role,
    });
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    return createErrorResponse('MEMBER_FETCH_FAILED', 500);
  }
}
