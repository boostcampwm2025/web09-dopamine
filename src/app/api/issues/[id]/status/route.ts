import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { redisKeys } from '@/lib/redis-keys';
import { transferIssueData } from '@/lib/transfer';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const issueKey = redisKeys.issue(id);

  const exists = await redis.exists(issueKey);

  if (!exists) {
    return NextResponse.json({ message: '존재하지 않는 이슈입니다.' }, { status: 404 });
  }

  const issue = await redis.hgetall(issueKey);
  return NextResponse.json(issue);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { status, selectedIdeaId = null } = await req.json();
  const { id } = await params;
  const issueKey = redisKeys.issue(id);

  const exists = await redis.exists(issueKey);

  if (!exists) {
    return NextResponse.json({ message: '존재하지 않는 이슈입니다.' }, { status: 404 });
  }

  // Redis 상태 업데이트
  await redis.hset(issueKey, 'status', status);

  // 이슈 종료 시: Redis → MySQL 데이터 이관 후 리포트 생성
  if (status === 'CLOSE') {
    try {
      await transferIssueData(id);
      // await generateReport(id)

      const updated = await redis.hgetall(issueKey);
      return NextResponse.json({
        ...updated,
        message: '이슈가 종료되고 리포트가 생성되었습니다.',
      });
    } catch (error) {
      console.error('Error closing issue and generating report:', error);
      const updated = await redis.hgetall(issueKey);
      return NextResponse.json(
        {
          ...updated,
          error: '리포트 생성 중 오류가 발생했습니다.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      );
    }
  }

  const updated = await redis.hgetall(issueKey);
  return NextResponse.json(updated);
}
