import { NextRequest, NextResponse } from 'next/server';
import { IssueStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { findIssueById, updateIssueStatus } from '@/lib/repositories/issue.repository';
import { createReport, findReportByIssueId } from '@/lib/repositories/report.repository';
import {
  createWordClouds,
  findIssueTextSourcesForWordCloud,
} from '@/lib/repositories/word-cloud.repository';
import { generateWordCloudData } from '@/lib/utils/word-cloud-processor';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { status, selectedIdeaId = null, memo = null } = await req.json();
    const { id } = await params;

    if (!Object.values(IssueStatus).includes(status)) {
      return NextResponse.json({ message: '유효하지 않은 이슈 상태입니다.' }, { status: 400 });
    }

    const issue = await findIssueById(id);

    if (!issue) {
      return NextResponse.json({ message: '존재하지 않는 이슈입니다.' }, { status: 404 });
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

    return NextResponse.json(updatedIssue);
  } catch (error) {
    console.error('이슈 상태 변경 실패:', error);
    return NextResponse.json({ message: '이슈 상태 변경에 실패했습니다.' }, { status: 500 });
  }
}
