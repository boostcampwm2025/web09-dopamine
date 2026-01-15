import { NextRequest, NextResponse } from 'next/server';
import type { FilterType } from '@/app/(with-sidebar)/issue/hooks/use-filter-idea';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { ideaFilterService } from '@/lib/services/idea-filter.service';
import { broadcast } from '@/lib/services/sse-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter');

  try {
    const ideas = await ideaRepository.findByIssueId(id);

    if (filter && filter !== 'none') {
      const filteredIds = ideaFilterService.getFilteredIdeaIds(
        ideas.map((idea) => ({
          id: idea.id,
          agreeCount: idea.agreeCount ?? 0,
          disagreeCount: idea.disagreeCount ?? 0,
        })),
        filter as FilterType,
      );

      return NextResponse.json({ filteredIds: Array.from(filteredIds) });
    }

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('아이디어 조회 실패:', error);
    return NextResponse.json({ message: '아이디어 조회에 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;
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

    return NextResponse.json(newIdea, { status: 201 });
  } catch (error) {
    console.error('아이디어 생성 실패:', error);
    return NextResponse.json({ message: '아이디어 생성에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;
  const { searchParams } = new URL(req.url);
  const ideaId = searchParams.get('ideaId');

  if (!ideaId) {
    return NextResponse.json({ message: 'ideaId가 필요합니다.' }, { status: 400 });
  }

  try {
    // 본인 아이디어가 아니라면, 삭제를 방지해야함
    // 아직 인증/인가 로직이 없으므로 생략

    await ideaRepository.softDelete(ideaId);

    // SSE 브로드캐스팅: 아이디어 삭제 이벤트
    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.IDEA_DELETED,
        data: { ideaId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('아이디어 삭제 실패:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ message: '존재하지 않는 아이디어입니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '아이디어 삭제에 실패했습니다.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;
  const { ideaId, positionX, positionY, categoryId } = await req.json();
  const cacheKey = `issue:${issueId}:ideas`;

  if (!ideaId) {
    return NextResponse.json({ message: 'ideaId가 필요합니다.' }, { status: 400 });
  }

  try {
    const updatedIdea = await ideaRepository.update(ideaId, {
      positionX,
      positionY,
      categoryId,
    });

    // SSE 브로드캐스팅: 아이디어 이동 이벤트
    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.IDEA_MOVED,
        data: { ideaId, positionX, positionY, categoryId },
      },
    });

    return NextResponse.json(updatedIdea);
  } catch (error: any) {
    console.error('아이디어 수정 실패:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ message: '아이디어를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '아이디어 수정에 실패했습니다.' }, { status: 500 });
  }
}
