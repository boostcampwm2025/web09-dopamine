import { NextRequest, NextResponse } from 'next/server';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; searchTerm: string }> },
): Promise<NextResponse> {
  const { id, searchTerm } = await params;

  try {
    const members = await issueMemberRepository.findMembersByNickname(id, searchTerm);
    return createSuccessResponse(members);
  } catch (error) {
    console.error('멤버 검색 조회 실패:', error);
    return createErrorResponse('MEMBER_FETCH_FAILED', 500);
  }
}
