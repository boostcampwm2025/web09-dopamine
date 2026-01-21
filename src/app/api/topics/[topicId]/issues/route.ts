import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const { topicId } = await params;

  try {
    const issues = await prisma.issue.findMany({
      where: {
        topicId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return createSuccessResponse(issues, 200);
  } catch (error) {
    console.error('이슈 조회 실패:', error);
    return createErrorResponse('ISSUES_FETCH_FAILED', 500);
  }
}
