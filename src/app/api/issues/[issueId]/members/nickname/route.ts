import { NextRequest } from 'next/server';
import { issueMemberService } from '@/lib/services/issue-member.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ issueId: string }> }) {
  const { issueId: id } = await params;

  try {
    const newNickname = await issueMemberService.createUniqueNickname(id);

    return createSuccessResponse({ nickname: newNickname });
  } catch (error) {
    return createErrorResponse('NICKNAME_GENERATION_FAILED', 500);
  }
}
