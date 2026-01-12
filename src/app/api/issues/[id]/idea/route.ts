import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { prisma } from '@/lib/prisma';

const CACHE_TTL = 3600; // 1시간

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ issueId: string }> },
): Promise<NextResponse> {
  const { issueId } = await params;
  const cacheKey = `issue:${issueId}:ideas`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json({
        ideas: JSON.parse(cachedData),
        source: 'cache',
      });
    }

    const ideas = await prisma.idea.findMany({
      where: {
        issueId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            title: true,
          },
        },
        votes: {
          where: { deletedAt: null },
        },
        comments: {
          where: { deletedAt: null },
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(ideas));

    return NextResponse.json({ ideas, source: 'database' });
  } catch (error) {
    console.error('아이디어 조회 실패:', error);
    return NextResponse.json(
      { message: '아이디어 조회에 실패했습니다.' },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;
  const { content, userId, positionX, positionY, categoryId } =
    await req.json();
  const cacheKey = `issue:${issueId}:ideas`;

  try {
    const newIdea = await prisma.idea.create({
      data: {
        issueId,
        userId,
        content,
        positionX,
        positionY,
        categoryId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    await redis.del(cacheKey);

    return NextResponse.json(newIdea, { status: 201 });
  } catch (error) {
    console.error('아이디어 생성 실패:', error);
    return NextResponse.json(
      { message: '아이디어 생성에 실패했습니다.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: issueId } = await params;
  const { searchParams } = new URL(req.url);
  const ideaId = searchParams.get('ideaId');
  const cacheKey = `issue:${issueId}:ideas`;

  if (!ideaId) {
    return NextResponse.json(
      { message: 'ideaId가 필요합니다.' },
      { status: 400 },
    );
  }

  try {
    await prisma.idea.update({
      where: { id: ideaId },
      data: { deletedAt: new Date() },
    });

    await redis.del(cacheKey);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('아이디어 삭제 실패:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: '존재하지 않는 아이디어입니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: '아이디어 삭제에 실패했습니다.' },
      { status: 500 },
    );
  }
}
