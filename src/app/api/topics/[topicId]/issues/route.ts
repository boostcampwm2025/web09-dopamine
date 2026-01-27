import { NextRequest } from 'next/server';
import { IssueRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { createIssue } from '@/lib/repositories/issue.repository';
import { getUserIdFromHeader } from '@/lib/utils/api-auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;

  try {
    const issues = await prisma.issue.findMany({
      where: {
        topicId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return createSuccessResponse(issues, 200);
  } catch (error) {
    console.error('이슈 조회 실패:', error);
    return createErrorResponse('ISSUES_FETCH_FAILED', 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const { title } = await req.json();
  const userId = getUserIdFromHeader(req)!;

  if (!title) {
    return createErrorResponse('TITLE_REQUIRED', 400);
  }

  try {
    const issueId = await prisma.$transaction(async (tx) => {
      const issue = await createIssue(tx, title, topicId);
      await issueMemberRepository.addIssueOwner(tx, issue.id, userId, IssueRole.OWNER);

      return issue.id;
    });

    return createSuccessResponse({ issueId: issueId }, 201);
  } catch (error) {
    console.error('토픽 이슈 생성 실패:', error);
    return createErrorResponse('ISSUE_CREATE_FAILED', 500);
  }
}
