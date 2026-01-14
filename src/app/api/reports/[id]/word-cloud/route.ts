import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findReportByIssueId } from '@/lib/repositories/report.repository';
import {
  createWordClouds,
  findWordCloudsByReportId,
} from '@/lib/repositories/word-cloud.repository';
import { generateWordCloudData } from '@/lib/utils/word-cloud-processor';

/**
 * 워드클라우드 데이터 조회
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 리포트 조회
    const report = await findReportByIssueId(id);
    if (!report) {
      return NextResponse.json({ error: '리포트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 워드클라우드 데이터 조회
    const wordClouds = await findWordCloudsByReportId(report.id);

    return NextResponse.json({ wordClouds });
  } catch (error) {
    console.error('워드클라우드 조회 실패:', error);
    return NextResponse.json({ error: '워드클라우드 조회에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 워드클라우드 데이터 생성
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 리포트 조회
    const report = await findReportByIssueId(id);
    if (!report) {
      return NextResponse.json({ error: '리포트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 이슈의 모든 아이디어와 댓글 조회
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        ideas: {
          where: { deletedAt: null },
          select: {
            content: true,
            comments: {
              where: { deletedAt: null },
              select: {
                content: true,
              },
            },
          },
        },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: '이슈를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 모든 댓글 수집
    const allComments = issue.ideas.flatMap((idea) => idea.comments);

    // 워드클라우드 데이터 생성
    const wordCloudData = generateWordCloudData({
      ideas: issue.ideas.map((idea) => ({ content: idea.content })),
      comments: allComments,
      memo: report.memo,
    });

    // 워드클라우드 데이터 저장
    await createWordClouds(report.id, wordCloudData);

    return NextResponse.json({ success: true, wordClouds: wordCloudData });
  } catch (error) {
    console.error('워드클라우드 생성 실패:', error);
    return NextResponse.json({ error: '워드클라우드 생성에 실패했습니다.' }, { status: 500 });
  }
}
