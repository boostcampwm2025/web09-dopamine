import { prisma } from '@/lib/prisma';
import {
  createWordClouds,
  findIssueTextSourcesForWordCloud,
  findWordCloudsByReportId,
} from '@/lib/repositories/word-cloud.repository';
import { PrismaTransaction } from '@/types/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    wordCloud: {
      updateMany: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
    },
    issue: {
      findUnique: jest.fn(),
    },
  },
}));

const mockedWordCloud = prisma.wordCloud as jest.Mocked<typeof prisma.wordCloud>;
const mockedIssue = prisma.issue as jest.Mocked<typeof prisma.issue>;

describe('Word Cloud Repository 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('워드클라우드 저장 시 기존 데이터를 Soft Delete하고 신규 데이터를 생성한다', async () => {
    // 역할: 동일 리포트에 대한 중복 데이터 누적을 막고 최신 데이터만 유지한다.
    mockedWordCloud.updateMany.mockResolvedValue({ count: 2 } as any);
    mockedWordCloud.createMany.mockResolvedValue({ count: 2 } as any);

    await createWordClouds('report-1', [
      { word: '테스트', count: 3 },
      { word: '단어', count: 2 },
    ]);

    expect(mockedWordCloud.updateMany).toHaveBeenCalledWith({
      where: { reportId: 'report-1', deletedAt: null },
      data: { deletedAt: expect.any(Date) },
    });
    expect(mockedWordCloud.createMany).toHaveBeenCalledWith({
      data: [
        { reportId: 'report-1', word: '테스트', count: 3 },
        { reportId: 'report-1', word: '단어', count: 2 },
      ],
    });
  });

  it('워드클라우드 저장은 트랜잭션이 전달되면 해당 클라이언트를 사용한다', async () => {
    // 역할: 워드클라우드 저장이 다른 작업과 함께 원자적으로 처리되도록 보장한다.
    const mockTx = {
      wordCloud: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    } as unknown as PrismaTransaction;

    await createWordClouds(
      'report-1',
      [
        { word: 'A', count: 1 },
        { word: 'B', count: 2 },
      ],
      mockTx,
    );

    expect(mockTx.wordCloud.updateMany).toHaveBeenCalledWith({
      where: { reportId: 'report-1', deletedAt: null },
      data: { deletedAt: expect.any(Date) },
    });
    expect(mockTx.wordCloud.createMany).toHaveBeenCalledWith({
      data: [
        { reportId: 'report-1', word: 'A', count: 1 },
        { reportId: 'report-1', word: 'B', count: 2 },
      ],
    });
  });

  it('리포트 ID로 워드클라우드 데이터를 개수 기준 내림차순 조회한다', async () => {
    // 역할: 시각화에서 높은 빈도 단어가 먼저 나오도록 정렬 조건을 보장한다.
    mockedWordCloud.findMany.mockResolvedValue([{ word: '테스트' }] as any);

    await findWordCloudsByReportId('report-1');

    expect(mockedWordCloud.findMany).toHaveBeenCalledWith({
      where: { reportId: 'report-1', deletedAt: null },
      orderBy: { count: 'desc' },
    });
  });

  it('트랜잭션 미전달 시 기본 prisma로 텍스트 소스를 조회한다', async () => {
    // 역할: 기본 경로에서도 아이디어/댓글 include 구성이 유지되는지 확인한다.
    mockedIssue.findUnique.mockResolvedValue({ id: 'issue-1' } as any);

    await findIssueTextSourcesForWordCloud('issue-1');

    expect(mockedIssue.findUnique).toHaveBeenCalledWith({
      where: { id: 'issue-1' },
      include: {
        ideas: {
          where: { deletedAt: null },
          select: {
            content: true,
            comments: {
              where: { deletedAt: null },
              select: { content: true },
            },
          },
        },
      },
    });
  });

  it('워드클라우드 생성을 위한 이슈 텍스트 소스를 조회한다(트랜잭션 사용)', async () => {
    // 역할: 아이디어/댓글 내용이 누락되면 분석 결과가 왜곡되므로 include 구성을 확인한다.
    const mockTx = {
      issue: {
        findUnique: jest.fn().mockResolvedValue({ id: 'issue-1' }),
      },
    } as unknown as PrismaTransaction;

    await findIssueTextSourcesForWordCloud('issue-1', mockTx);

    expect(mockTx.issue.findUnique).toHaveBeenCalledWith({
      where: { id: 'issue-1' },
      include: {
        ideas: {
          where: { deletedAt: null },
          select: {
            content: true,
            comments: {
              where: { deletedAt: null },
              select: { content: true },
            },
          },
        },
      },
    });
    expect(mockedIssue.findUnique).not.toHaveBeenCalled();
  });
});
