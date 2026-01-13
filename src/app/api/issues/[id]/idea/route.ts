import { NextRequest, NextResponse } from 'next/server';
import { ideaRepository } from '@/lib/repositories/idea.repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const ideas = await ideaRepository.findByIssueId(id);

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
