import { NextRequest, NextResponse } from 'next/server';
import { commentRepository } from '@/lib/repositories/comment.repository';

/**
 * [GET] 특정 아이디어의 댓글 목록 조회 API
 * 경로: /api/ideas/[id]/comment
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: ideaId } = await params;

  try {
    // 리포지토리를 통해 해당 아이디어의 댓글 목록을 가져옴
    const comments = await commentRepository.findByIdeaId(ideaId);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('댓글 조회 중 오류 발생:', error);
    return NextResponse.json(
      { message: '댓글을 불러오는 중에 서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * [POST] 새로운 댓글 생성 API
 * 경로: /api/ideas/[id]/comment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: ideaId } = await params;
  const { userId, content } = await req.json();

  // 필수 데이터 유효성 검사
  if (!userId || !content) {
    return NextResponse.json(
      { message: '사용자 ID와 댓글 내용은 필수 입력 사항입니다.' },
      { status: 400 },
    );
  }

  try {
    // 리포지토리를 사용하여 DB에 댓글 생성
    const comment = await commentRepository.create({
      ideaId,
      userId,
      content,
    });
    // 성공 시 201 Created 응답 반환
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('댓글 생성 중 오류 발생:', error);
    return NextResponse.json(
      { message: '댓글을 작성하는 중에 서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
