import { NextRequest, NextResponse } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { prisma } from '@/lib/prisma';
import { broadcast } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: issueId } = await params;
    const { selectedIdeaId } = await req.json();

    if (!selectedIdeaId) {
      return createErrorResponse('SELECTED_IDEA_ID_REQUIRED', 400);
    }

    const idea = await prisma.idea.findFirst({
      where: {
        id: selectedIdeaId,
        issueId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!idea) {
      return createErrorResponse('IDEA_NOT_FOUND', 404);
    }

    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.IDEA_SELECTED,
        data: { ideaId: selectedIdeaId },
      },
    });

    return createSuccessResponse({ ok: true });
  } catch (error) {
    console.error('선택된 아이디어를 브로드캐스팅 중 오류가 발생했습니다: ', error);
    return createErrorResponse('IDEA_SELECTION_BROADCAST_FAILED', 500);
  }
}
