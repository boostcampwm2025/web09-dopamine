import { GET } from '@/app/api/issues/[issueId]/reports/word-cloud/route';
import { findReportByIssueId } from '@/lib/repositories/report.repository';
import { findWordCloudsByReportId } from '@/lib/repositories/word-cloud.repository';
import {
  createMockGetRequest,
  createMockParams,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/repositories/report.repository');
jest.mock('@/lib/repositories/word-cloud.repository');

const mockedFindReportByIssueId = findReportByIssueId as jest.MockedFunction<
  typeof findReportByIssueId
>;
const mockedFindWordCloudsByReportId = findWordCloudsByReportId as jest.MockedFunction<
  typeof findWordCloudsByReportId
>;

describe('GET /api/issues/[issueId]/reports/word-cloud', () => {
  const issueId = 'issue-1';
  const reportId = 'report-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 워드클라우드를 조회한다', async () => {
    const mockReport = { id: reportId, issueId };
    const mockWordClouds = [
      { id: 'wc-1', word: '테스트', count: 10 },
      { id: 'wc-2', word: '개발', count: 5 },
    ];

    mockedFindReportByIssueId.mockResolvedValue(mockReport as any);
    mockedFindWordCloudsByReportId.mockResolvedValue(mockWordClouds as any);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.wordClouds).toEqual(mockWordClouds);
    expect(mockedFindReportByIssueId).toHaveBeenCalledWith(issueId);
    expect(mockedFindWordCloudsByReportId).toHaveBeenCalledWith(reportId);
  });

  it('리포트가 없으면 404 에러를 반환한다', async () => {
    mockedFindReportByIssueId.mockResolvedValue(null);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 404, 'REPORT_NOT_FOUND');
  });

  it('에러 발생 시 500 에러를 반환한다', async () => {
    mockedFindReportByIssueId.mockRejectedValue(new Error('Database error'));

    const req = createMockGetRequest();
    const params = createMockParams({ issueId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 500, 'WORD_CLOUD_FETCH_FAILED');
  });
});
