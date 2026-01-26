import { NextRequest, NextResponse } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { categoryRepository } from '@/lib/repositories/category.repository';
import { broadcast } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string; categoryId: string }> },
): Promise<NextResponse> {
  const { issueId, categoryId } = await params;
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

    return createSuccessResponse(category);
  } catch (error: any) {
    console.error('카테고리 수정 실패:', error);

    // Prisma에서 레코드를 찾을 수 없는 경우
    if (error.code === 'P2025') {
      return createErrorResponse('CATEGORY_NOT_FOUND', 404);
    }

    return createErrorResponse('CATEGORY_UPDATE_FAILED', 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ issueId: string; categoryId: string }> },
): Promise<NextResponse> {
  const { issueId, categoryId } = await params;

  try {
    await categoryRepository.softDelete(categoryId);

    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.CATEGORY_DELETED,
        data: { categoryId },
      },
    });

    return createSuccessResponse(null);
  } catch (error: any) {
    console.error('카테고리 삭제 실패:', error);

    // Prisma에서 레코드를 찾을 수 없는 경우
    if (error.code === 'P2025') {
      return createErrorResponse('CATEGORY_NOT_FOUND', 404);
    }

    return createErrorResponse('CATEGORY_DELETE_FAILED', 500);
  }
}
