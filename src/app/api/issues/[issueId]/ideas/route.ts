import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { FilterType } from '@/app/(with-sidebar)/issue/hooks';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { authOptions } from '@/lib/auth';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { ideaFilterService } from '@/lib/services/idea-filter.service';
import { broadcast } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';
import { getUserIdFromRequest } from '@/lib/utils/cookie';
import { getAuthenticatedUserId } from '@/lib/utils/auth-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string }> },
): Promise<NextResponse> {
  const { issueId: id } = await params;
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter');

  const userId = await getAuthenticatedUserId(req, id);

  try {
    const ideas = await ideaRepository.findByIssueId(id);
    const ideasWithCount = ideas.map((idea: any) => ({
      ...idea,
      commentCount: idea._count?.comments ?? 0,
    }));

    if (filter && filter !== 'none') {
      const filteredIds = ideaFilterService.getFilteredIdeaIds(
        ideasWithCount.map((idea) => ({
          id: idea.id,
          agreeCount: idea.agreeCount ?? 0,
          disagreeCount: idea.disagreeCount ?? 0,
        })),
        filter as FilterType,
      );

      return createSuccessResponse({ filteredIds: Array.from(filteredIds) });
    }

    return createSuccessResponse(ideasWithCount);
  } catch (error) {
    console.error('아이디어 조회 실패:', error);
    return createErrorResponse('IDEA_FETCH_FAILED', 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string }> },
): Promise<NextResponse> {
  const { issueId } = await params;
  const { content, userId, positionX, positionY, categoryId } = await req.json();

  try {
    const newIdea = await ideaRepository.create({
      issueId,
      userId,
      content,
      positionX,
      positionY,
      categoryId,
    });

    // SSE 브로드캐스팅: 아이디어 생성 이벤트
    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.IDEA_CREATED,
        data: { ideaId: newIdea.id },
      },
    });

    return createSuccessResponse(newIdea, 201);
  } catch (error) {
    console.error('아이디어 생성 실패:', error);
    return createErrorResponse('IDEA_CREATE_FAILED', 500);
  }
}
