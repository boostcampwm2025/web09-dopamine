import { NextRequest, NextResponse } from 'next/server';
import { IssueStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { findIssueById, updateIssueStatus } from '@/lib/repositories/issue.repository';
import { createReport, findReportByIssueId } from '@/lib/repositories/report.repository';

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
        if (!existingReport) {
          await createReport(id, selectedIdeaId, memo, tx);
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
