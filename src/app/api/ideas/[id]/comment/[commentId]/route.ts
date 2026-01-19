import { NextRequest, NextResponse } from 'next/server';
import { commentRepository } from '@/lib/repositories/comment.repository';

/**
 * [PATCH] 기존 댓글 내용 수정 API
 * 경로: /api/ideas/[id]/comment/[commentId]
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
): Promise<NextResponse> {
  const { commentId } = await params;
  const { content } = await req.json();

  // 필수 데이터 유효성 검사
  if (!content) {
    return NextResponse.json({ message: '수정할 댓글 내용을 입력해주세요.' }, { status: 400 });
  }

  try {
    // 리포지토리를 통해 댓글 내용 업데이트 수행
    const comment = await commentRepository.update(commentId, content);
    return NextResponse.json(comment);
  } catch (error: any) {
    console.error('댓글 수정 중 오류 발생:', error);

    // Prisma 에러 코드 P2025: 레코드를 찾을 수 없는 경우
    if (error.code === 'P2025') {
      return NextResponse.json({ message: '해당 댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(
      { message: '댓글을 수정하는 중에 서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * [DELETE] 댓글 논리 삭제(Soft Delete) API
 * 경로: /api/ideas/[id]/comment/[commentId]
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
): Promise<NextResponse> {
  const { commentId } = await params;

  try {
    // 리포지토리를 통해 deletedAt 컬럼을 업데이트(논리 삭제)
    await commentRepository.softDelete(commentId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('댓글 삭제 중 오류 발생:', error);

    // Prisma 에러 코드 P2025: 레코드를 찾을 수 없는 경우
    if (error.code === 'P2025') {
      return NextResponse.json({ message: '해당 댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(
      { message: '댓글을 삭제하는 중에 서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
