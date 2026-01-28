import { prisma } from '@/lib/prisma';
import {
  createWordClouds,
  findIssueTextSourcesForWordCloud,
} from '@/lib/repositories/word-cloud.repository';

describe('word-cloud.repository 통합 테스트', () => {
  const created = {
    userId: '' as string,
    issueId: '' as string,
    ideaId: '' as string,
    commentIds: [] as string[],
    reportId: '' as string,
    wordCloudIds: [] as string[],
  };

  beforeAll(async () => {
    // 역할: DB 연결이 정상인지 미리 확인해 테스트 중간 실패를 줄인다.
    await prisma.$queryRaw`SELECT 1`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    if (created.wordCloudIds.length > 0) {
      await prisma.wordCloud.deleteMany({ where: { id: { in: created.wordCloudIds } } });
      created.wordCloudIds = [];
    }
    if (created.reportId) {
      await prisma.report.deleteMany({ where: { id: created.reportId } });
      created.reportId = '';
    }
    if (created.commentIds.length > 0) {
      await prisma.comment.deleteMany({ where: { id: { in: created.commentIds } } });
      created.commentIds = [];
    }
    if (created.ideaId) {
      await prisma.idea.deleteMany({ where: { id: created.ideaId } });
      created.ideaId = '';
    }
    if (created.issueId) {
      await prisma.issue.deleteMany({ where: { id: created.issueId } });
      created.issueId = '';
    }
    if (created.userId) {
      await prisma.user.deleteMany({ where: { id: created.userId } });
      created.userId = '';
    }
  });

  it('워드클라우드 저장 시 기존 데이터가 Soft Delete되고 새 데이터가 생성된다', async () => {
    // 역할: 실제 DB에서 updateMany + createMany의 일관성이 보장되는지 확인한다.
    const issue = await prisma.issue.create({
      data: { title: `itest-issue-${Date.now()}` },
    });
    created.issueId = issue.id;

    const report = await prisma.report.create({
      data: { issueId: issue.id, selectedIdeaId: null, memo: null },
    });
    created.reportId = report.id;

    const old = await prisma.wordCloud.create({
      data: { reportId: report.id, word: 'old', count: 1 },
    });
    created.wordCloudIds.push(old.id);

    await createWordClouds(report.id, [
      { word: 'new', count: 2 },
      { word: 'word', count: 3 },
    ]);

    const all = await prisma.wordCloud.findMany({
      where: { reportId: report.id },
      orderBy: { word: 'asc' },
    });

    const oldRow = all.find((item) => item.id === old.id);
    const newRows = all.filter((item) => item.word !== 'old');

    expect(oldRow?.deletedAt).toBeInstanceOf(Date);
    expect(newRows.length).toBe(2);
    expect(newRows.every((row) => row.deletedAt === null)).toBe(true);
    created.wordCloudIds.push(...newRows.map((row) => row.id));
  });

  it('이슈 텍스트 소스 조회 시 삭제되지 않은 아이디어/댓글만 포함된다', async () => {
    // 역할: 실제 DB에서 nested 필터가 정상 동작하는지 검증한다.
    const user = await prisma.user.create({
      data: {
        email: `user-${Date.now()}@example.com`,
        displayName: '테스터',
        provider: null,
      },
    });
    created.userId = user.id;

    const issue = await prisma.issue.create({
      data: { title: `itest-issue-${Date.now()}` },
    });
    created.issueId = issue.id;

    const idea = await prisma.idea.create({
      data: { issueId: issue.id, userId: user.id, content: '아이디어' },
    });
    created.ideaId = idea.id;

    const comment1 = await prisma.comment.create({
      data: { ideaId: idea.id, userId: user.id, content: '댓글1' },
    });
    const deletedComment = await prisma.comment.create({
      data: { ideaId: idea.id, userId: user.id, content: '삭제댓글', deletedAt: new Date() },
    });
    created.commentIds.push(comment1.id, deletedComment.id);

    const result = await findIssueTextSourcesForWordCloud(issue.id);

    expect(result?.ideas).toHaveLength(1);
    expect(result?.ideas[0].comments).toHaveLength(1);
    expect(result?.ideas[0].comments[0].content).toBe('댓글1');
  });
});
