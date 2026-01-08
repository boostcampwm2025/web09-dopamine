import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { status } = await req.json();
  const { id } = await params;
  const issueKey = `issue:${id}`;

  const exists = await redis.exists(issueKey);

  if (!exists) {
    return NextResponse.json({ message: '존재하지 않는 이슈입니다.' }, { status: 404 });
  }

  await redis.hset(issueKey, 'status', status);

  const updated = await redis.hgetall(issueKey);
  return NextResponse.json(updated);
}
