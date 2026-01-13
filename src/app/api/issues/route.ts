import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import redis from '@/lib/redis';

export async function POST(req: NextRequest) {
  const { title, nickname } = await req.json();

  if (!nickname || !title) {
    return NextResponse.json({ message: 'nickname과 title은 필수입니다.' }, { status: 400 });
  }

  const issueId = randomUUID();
  const userId = randomUUID();
  const now = Date.now();

  await redis.hset(`issue:${issueId}`, {
    id: issueId,
    title,
    status: 'BRAINSTORMING',
    created_at: now,
    updated_at: now,
  });

  await redis.sadd(`issue:${issueId}:users`, userId);

  await redis.hset(`issue:${issueId}:user:${userId}`, {
    id: userId,
    display_name: nickname ?? '익명',
    role: 'owner',
    joined_at: now,
  });

  return NextResponse.json({ issueId, userId }, { status: 201 });
}
