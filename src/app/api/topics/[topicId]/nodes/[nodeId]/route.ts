import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string; nodeId: string }> },
) {
  const { nodeId } = await params;
  const { positionX, positionY } = await req.json();

  if (positionX === undefined || positionY === undefined) {
    return createErrorResponse('POSITION_REQUIRED', 400);
  }

  try {
    const node = await prisma.issueNode.update({
      where: {
        id: nodeId,
      },
      data: {
        positionX,
        positionY,
      },
    });

    return createSuccessResponse(node, 200);
  } catch (error) {
    console.error('노드 위치 업데이트 실패:', error);
    return createErrorResponse('NODE_UPDATE_FAILED', 500);
  }
}
