import { NextRequest, NextResponse } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { categoryRepository } from '@/lib/repositories/category.repository';
import { broadcast } from '@/lib/sse/sse-service';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> },
): Promise<NextResponse> {
  const { id: issueId, categoryId } = await params;
  const { title, positionX, positionY, width, height } = await req.json();

  try {
    const category = await categoryRepository.update(categoryId, {
      title,
      positionX,
      positionY,
      width,
      height,
    });

    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.CATEGORY_UPDATED,
        data: { categoryId },
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('카테고리 수정 실패:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ message: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '카테고리 수정에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> },
): Promise<NextResponse> {
  const { id: issueId, categoryId } = await params;

  try {
    await categoryRepository.softDelete(categoryId);

    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.CATEGORY_DELETED,
        data: { categoryId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('카테고리 삭제 실패:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ message: '카테고리를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '카테고리 삭제에 실패했습니다.' }, { status: 500 });
  }
}
