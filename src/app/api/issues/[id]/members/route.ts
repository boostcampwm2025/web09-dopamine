import { NextRequest, NextResponse } from 'next/server';
import { findMembersByIssueId } from '@/lib/repositories/issue-member.repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const members = await findMembersByIssueId(id);

    console.log(members);

    if (!members) {
      return NextResponse.json({ message: '참여자가 존재하지 않습니다.' }, { status: 404 });
    }

    const response = members.map((member) => ({
      id: member.user.id,
      displayName: member.user.displayName,
      role: member.role,
      isConnected: true, // 지금은 기본값, 나중에 SSE 붙이면 여기서 합치면 됨
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('이슈 조회 실패:', error);
    return NextResponse.json({ message: '이슈 조회에 실패했습니다.' }, { status: 500 });
  }
}
