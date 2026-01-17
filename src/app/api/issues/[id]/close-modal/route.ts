import { NextRequest, NextResponse } from 'next/server';
import { MEMBER_ROLE } from '@/constants/issue';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { broadcast } from '@/lib/sse/sse-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;

  // userId 추출
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ message: 'User ID is required.' }, { status: 401 });
  }

  // 방장 권한 확인
  const member = await issueMemberRepository.findMemberByUserId(issueId, userId);

  if (!member || member.role !== MEMBER_ROLE.OWNER) {
    return NextResponse.json({ message: 'Only owner can open close modal.' }, { status: 403 });
  }

  // SSE 브로드캐스팅
  broadcast({
    issueId,
    event: {
      type: SSE_EVENT_TYPES.CLOSE_MODAL_OPENED,
      data: {},
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;

  // userId 추출
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ message: 'User ID is required.' }, { status: 401 });
  }

  // 방장 권한 확인
  const member = await issueMemberRepository.findMemberByUserId(issueId, userId);

  if (!member || member.role !== MEMBER_ROLE.OWNER) {
    return NextResponse.json({ message: 'Only owner can close modal.' }, { status: 403 });
  }

  // SSE 브로드캐스팅
  broadcast({
    issueId,
    event: {
      type: SSE_EVENT_TYPES.CLOSE_MODAL_CLOSED,
      data: {},
    },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;
  const { memo } = await req.json();

  // userId 추출
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ message: 'User ID is required.' }, { status: 401 });
  }

  // 방장 권한 확인
  const member = await issueMemberRepository.findMemberByUserId(issueId, userId);

  if (!member || member.role !== MEMBER_ROLE.OWNER) {
    return NextResponse.json({ message: 'Only owner can update memo.' }, { status: 403 });
  }

  // SSE 브로드캐스팅
  broadcast({
    issueId,
    event: {
      type: SSE_EVENT_TYPES.CLOSE_MODAL_MEMO_UPDATED,
      data: { memo: memo || '' },
    },
  });

  return NextResponse.json({ success: true });
}
