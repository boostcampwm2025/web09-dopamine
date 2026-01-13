import { NextRequest, NextResponse } from 'next/server';
import { findIssueById } from '@/lib/repositories/issue.repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const issue = await findIssueById(id);

    if (!issue) {
      return NextResponse.json({ message: '존재하지 않는 이슈입니다.' }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error('이슈 조회 실패:', error);
    return NextResponse.json({ message: '이슈 조회에 실패했습니다.' }, { status: 500 });
  }
}
