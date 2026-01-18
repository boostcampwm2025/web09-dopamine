import { NextRequest, NextResponse } from 'next/server';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { categoryRepository } from '@/lib/repositories/category.repository';
import { sseManager } from '@/lib/sse/sse-manager';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;

  try {
    const categories = await categoryRepository.findByIssueId(issueId);

    return createSuccessResponse(categories);
  } catch (error) {
    console.error('카테고리 조회 실패:', error);
    return createErrorResponse('INTERNAL_ERROR', 500);
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

    sseManager.broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.CATEGORY_CREATED,
        data: { categoryId: category.id },
      },
    });

    return createSuccessResponse(category, 201);
  } catch (error) {
    console.error('카테고리 생성 실패:', error);
    return createErrorResponse('CATEGORY_CREATE_FAILED', 500);
  }
}
