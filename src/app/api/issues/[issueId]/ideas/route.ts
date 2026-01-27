import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import type { FilterType } from '@/app/(with-sidebar)/issue/hooks';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { authOptions } from '@/lib/auth';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { findIssueById } from '@/lib/repositories/issue.repository';
import { ideaFilterService } from '@/lib/services/idea-filter.service';
import { broadcast } from '@/lib/sse/sse-service';
import { getUserIdFromHeader } from '@/lib/utils/api-auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';
import { getUserIdFromRequest } from '@/lib/utils/cookie';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string }> },
): Promise<NextResponse> {
  const { issueId: id } = await params;
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter');
  const session = await getServerSession(authOptions);

  try {
    const issue = await findIssueById(id);
    if (!issue) {
      return createErrorResponse('ISSUE_NOT_FOUND', 404);
    }

    // 빠른 이슈인 경우 쿠키에서 userId 가져오기, 토픽 이슈인 경우 세션에서 가져오기
    const isQuickIssue = !issue.topicId;
    const userId = isQuickIssue
      ? getUserIdFromRequest(req, id) || undefined
      : session?.user?.id || getUserIdFromHeader(req) || undefined;

    const ideas = await ideaRepository.findByIssueId(id, userId);

    if (filter && filter !== 'none') {
      const filteredIds = ideaFilterService.getFilteredIdeaIds(
        ideas.map((idea) => ({
          id: idea.id,
          agreeCount: idea.agreeCount ?? 0,
          disagreeCount: idea.disagreeCount ?? 0,
        })),
        filter as FilterType,
      );

      return createSuccessResponse({ filteredIds: Array.from(filteredIds) });
    }

    return createSuccessResponse(ideas);
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
