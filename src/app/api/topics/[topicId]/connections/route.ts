import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ topicId: string }> }) {
  const { issueAId, issueBId, sourceHandle, targetHandle } = await req.json();

  if (!issueAId || !issueBId) {
    return createErrorResponse('ISSUE_IDS_REQUIRED', 400);
  }

  try {
    const connection = await prisma.issueConnection.create({
      data: {
        issueAId,
        issueBId,
        sourceHandle,
        targetHandle,
      },
    });

    return createSuccessResponse(connection, 201);
  } catch (error) {
    console.error('연결 생성 실패:', error);
    return createErrorResponse('CONNECTION_CREATE_FAILED', 500);
  }
}
