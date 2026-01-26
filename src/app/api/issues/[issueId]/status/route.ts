import { NextRequest, NextResponse } from 'next/server';
import { IssueStatus } from '@prisma/client';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { prisma } from '@/lib/prisma';
import { findIssueById, updateIssueStatus } from '@/lib/repositories/issue.repository';
import { createReport, findReportByIssueId } from '@/lib/repositories/report.repository';
import {
  createWordClouds,
  findIssueTextSourcesForWordCloud,
} from '@/lib/repositories/word-cloud.repository';
import { broadcast } from '@/lib/sse/sse-service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';
import { generateWordCloudData } from '@/lib/utils/word-cloud-processor';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string }> },
): Promise<NextResponse> {
  try {
    const { status, selectedIdeaId = null, memo = null } = await req.json();
    const { issueId: id } = await params;

    if (!Object.values(IssueStatus).includes(status)) {
      return createErrorResponse('INVALID_ISSUE_STATUS', 400);
    }

    const issue = await findIssueById(id);

    if (!issue) {
      return createErrorResponse('ISSUE_NOT_FOUND', 404);
    }

    // 이슈 종료시, 리포트 생성을 위해 트랜잭션을 사용합니다.
    const updatedIssue = await prisma.$transaction(async (tx) => {
      const issue = await updateIssueStatus(id, status, tx);

      if (status === IssueStatus.CLOSE) {
        const existingReport = await findReportByIssueId(id, tx);
        let report;

        if (!existingReport) {
          report = await createReport(id, selectedIdeaId, memo, tx);
        } else {
          report = existingReport;
        }

        // 워드클라우드 생성
        if (report) {
          // 이슈의 모든 아이디어와 댓글 조회
          const issueWithData = await findIssueTextSourcesForWordCloud(id, tx);

          if (issueWithData) {
            // 모든 댓글 수집
            const allComments = issueWithData.ideas.flatMap((idea) => idea.comments);

            // 워드클라우드 데이터 생성
            const wordCloudData = generateWordCloudData({
              ideas: issueWithData.ideas.map((idea) => ({ content: idea.content })),
              comments: allComments,
              memo: memo,
            });

            // 워드클라우드 데이터 저장
            await createWordClouds(report.id, wordCloudData, tx);
          }
        }
      }

      return issue;
    });

    // SSE 브로드캐스팅: 이슈 상태 변경 이벤트
    broadcast({
      issueId: id,
      event: {
        type: SSE_EVENT_TYPES.ISSUE_STATUS_CHANGED,
        data: { status: updatedIssue.status, issueId: id },
      },
    });

    return createSuccessResponse(updatedIssue);
  } catch (error) {
    console.error('이슈 상태 변경 실패:', error);
    return createErrorResponse('ISSUE_STATUS_UPDATE_FAILED', 500);
  }
}
