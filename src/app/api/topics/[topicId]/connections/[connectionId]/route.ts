import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string; connectionId: string }> },
) {
  const { connectionId } = await params;

  try {
    await prisma.issueConnection.update({
      where: {
        id: connectionId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return createSuccessResponse(null, 200);
  } catch (error) {
    console.error('연결 삭제 실패:', error);
    return createErrorResponse('CONNECTION_DELETE_FAILED', 500);
  }
}
