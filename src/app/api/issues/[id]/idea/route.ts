import { NextRequest, NextResponse } from 'next/server';
import { ideaRepository } from '@/lib/repositories/idea.repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const ideas = await ideaRepository.findByIssueId(id);

    // ideas 배열을 순회하며 각 아이디어 객체에 찬성/반대 카운트를 추가
    const ideasWithCounts = ideas.map((idea) => {
      const agreeCount =
        idea.votes?.filter((vote) => vote.type === 'AGREE').length ?? 0;
      const disagreeCount =
        idea.votes?.filter((vote) => vote.type === 'DISAGREE').length ?? 0;
      const { votes, ...rest } = idea;

      // 아이디어 데이터(rest)에 계산된 카운트를 합쳐서 새로운 객체 반환
      return {
        ...rest,
        agreeCount,
        disagreeCount,
      };
    });

    return NextResponse.json({ ideas: ideasWithCounts });
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
    await ideaRepository.softDelete(ideaId);

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
    return NextResponse.json(
      { message: 'ideaId가 필요합니다.' },
      { status: 400 },
    );
  }

  try {
    const updatedIdea = await ideaRepository.update(ideaId, {
      positionX,
      positionY,
      categoryId,
    });

    return NextResponse.json(updatedIdea);
  } catch (error: any) {
    console.error('아이디어 수정 실패:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: '아이디어를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: '아이디어 수정에 실패했습니다.' },
      { status: 500 },
    );
  }
}
