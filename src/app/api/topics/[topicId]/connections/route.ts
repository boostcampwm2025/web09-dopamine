import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const { topicId } = await params;

  try {
    const connections = await prisma.issueConnection.findMany({
      where: {
        deletedAt: null,
        sourceIssue: {
          topicId,
          deletedAt: null,
        },
        targetIssue: {
          topicId,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        sourceIssueId: true,
        targetIssueId: true,
        sourceHandle: true,
        targetHandle: true,
      },
    });

    return createSuccessResponse(connections, 200);
  } catch (error) {
    console.error('연결 조회 실패:', error);
    return createErrorResponse('CONNECTIONS_FETCH_FAILED', 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ topicId: string }> }) {
  const { sourceIssueId, targetIssueId, sourceHandle, targetHandle } = await req.json();

  if (!sourceIssueId || !targetIssueId) {
    return createErrorResponse('ISSUE_IDS_REQUIRED', 400);
  }

  try {
    const connection = await prisma.issueConnection.create({
      data: {
        sourceIssueId,
        targetIssueId,
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
