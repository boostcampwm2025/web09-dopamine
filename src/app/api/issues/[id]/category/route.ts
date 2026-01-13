import { NextRequest, NextResponse } from 'next/server';
import { categoryRepository } from '@/lib/repositories/category-repository';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;

  try {
    const categories = await categoryRepository.findByIssueId(issueId);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('카테고리 조회 실패:', error);
    return NextResponse.json(
      { message: '카테고리 조회에 실패했습니다.' },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;
  const { title, positionX, positionY, width, height } = await req.json();

  try {
    const category = await categoryRepository.create({
      issueId,
      title,
      positionX,
      positionY,
      width,
      height,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('카테고리 생성 실패:', error);
    return NextResponse.json(
      { message: '카테고리 생성에 실패했습니다.' },
      { status: 500 },
    );
  }
}
