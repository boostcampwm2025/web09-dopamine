import { NextRequest, NextResponse } from 'next/server';
import { categoryRepository } from '@/lib/repositories/category-repository';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> },
): Promise<NextResponse> {
  const { categoryId } = await params;
  const { title, positionX, positionY, width, height } = await req.json();

  try {
    const category = await categoryRepository.update(categoryId, {
      title,
      positionX,
      positionY,
      width,
      height,
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('카테고리 수정 실패:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: '카테고리를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: '카테고리 수정에 실패했습니다.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> },
): Promise<NextResponse> {
  const { categoryId } = await params;

  try {
    await categoryRepository.softDelete(categoryId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('카테고리 삭제 실패:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: '카테고리를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: '카테고리 삭제에 실패했습니다.' },
      { status: 500 },
    );
  }
}
