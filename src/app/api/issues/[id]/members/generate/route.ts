import { NextRequest, NextResponse } from 'next/server';
import { issueMemberService } from '@/lib/services/issue-member.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const newNickname = await issueMemberService.createUniqueNickname(id);

    return NextResponse.json({ nickname: newNickname });
  } catch (error) {
    return NextResponse.json({ error: '닉네임 생성 실패' }, { status: 500 });
  }
}
