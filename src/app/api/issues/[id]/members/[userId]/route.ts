import { NextRequest, NextResponse } from 'next/server';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> },
): Promise<NextResponse> {
  const { id: issueId, userId } = await params;

  try {
    const member = await issueMemberRepository.findMemberByUserId(issueId, userId);

    if (!member) {
      return NextResponse.json({ message: '참여자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      id: member.user.id,
      displayName: member.user.displayName,
      role: member.role,
    });
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    return NextResponse.json({ message: '사용자 정보 조회에 실패했습니다.' }, { status: 500 });
  }
}
