import { prisma } from '@/lib/prisma';
import { voteRepository } from '@/lib/repositories/vote.repository';

describe('vote.repository 통합 테스트', () => {
  const created = {
    userId: '' as string,
    issueId: '' as string,
    ideaId: '' as string,
  };

  beforeAll(async () => {
    // 역할: DB 연결이 정상인지 미리 확인해 테스트 중간 실패를 줄인다.
    await prisma.$queryRaw`SELECT 1`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
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

  it('투표 집계 카운트가 원자적으로 증가한다', async () => {
    // 역할: 실제 DB에서 increment가 정확히 반영되는지 검증한다.
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
      data: {
        issueId: issue.id,
        userId: user.id,
        content: '아이디어',
        agreeCount: 0,
        disagreeCount: 0,
      },
    });
    created.ideaId = idea.id;

    await prisma.$transaction((tx) =>
      voteRepository.updateIdeaCounts(idea.id, { agreeCount: { increment: 1 } }, tx),
    );

    const updated = await prisma.idea.findUnique({ where: { id: idea.id } });

    expect(updated?.agreeCount).toBe(1);
    expect(updated?.disagreeCount).toBe(0);
  });
});
