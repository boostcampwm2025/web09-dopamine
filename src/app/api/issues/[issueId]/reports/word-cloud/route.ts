import { NextRequest, NextResponse } from 'next/server';
import { findReportByIssueId } from '@/lib/repositories/report.repository';
import { findWordCloudsByReportId } from '@/lib/repositories/word-cloud.repository';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

/**
 * 워드클라우드 데이터 조회
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 리포트 조회
    const report = await findReportByIssueId(id);
    if (!report) {
      return createErrorResponse('REPORT_NOT_FOUND', 404);
    }

    // 워드클라우드 데이터 조회
    const wordClouds = await findWordCloudsByReportId(report.id);

    return createSuccessResponse({ wordClouds });
  } catch (error) {
    console.error('워드클라우드 조회 실패:', error);
    return createErrorResponse('WORD_CLOUD_FETCH_FAILED', 500);
  }
}
