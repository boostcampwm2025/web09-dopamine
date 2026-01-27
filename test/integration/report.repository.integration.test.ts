import { prisma } from '@/lib/prisma';
import { findReportWithDetailsById } from '@/lib/repositories/report.repository';

describe('report.repository 통합 테스트', () => {
  const created = {
    userIds: [] as string[],
    issueId: '' as string,
    categoryIds: [] as string[],
    ideaIds: [] as string[],
    commentIds: [] as string[],
    voteIds: [] as string[],
    issueMemberIds: [] as string[],
    reportId: '' as string,
  };

  beforeAll(async () => {
    // 역할: DB 연결이 정상인지 미리 확인해 테스트 중간 실패를 줄인다.
    await prisma.$queryRaw`SELECT 1`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    if (created.voteIds.length > 0) {
      await prisma.vote.deleteMany({ where: { id: { in: created.voteIds } } });
      created.voteIds = [];
    }
    if (created.commentIds.length > 0) {
      await prisma.comment.deleteMany({ where: { id: { in: created.commentIds } } });
      created.commentIds = [];
    }
    if (created.reportId) {
      await prisma.report.deleteMany({ where: { id: created.reportId } });
      created.reportId = '';
    }
    if (created.ideaIds.length > 0) {
      await prisma.idea.deleteMany({ where: { id: { in: created.ideaIds } } });
      created.ideaIds = [];
    }
    if (created.categoryIds.length > 0) {
      await prisma.category.deleteMany({ where: { id: { in: created.categoryIds } } });
      created.categoryIds = [];
    }
    if (created.issueMemberIds.length > 0) {
      await prisma.issueMember.deleteMany({ where: { id: { in: created.issueMemberIds } } });
      created.issueMemberIds = [];
    }
    if (created.issueId) {
      await prisma.issue.deleteMany({ where: { id: created.issueId } });
      created.issueId = '';
    }
    if (created.userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: created.userIds } } });
      created.userIds = [];
    }
  });

  it('리포트 상세 조회 시 조인/필터 결과가 정확히 반환된다', async () => {
    // 역할: 실제 DB에서 다중 조인과 deletedAt 필터가 기대대로 동작하는지 검증한다.
    const user1 = await prisma.user.create({
      data: {
        email: `u1-${Date.now()}@example.com`,
        displayName: '사용자1',
        provider: null,
      },
    });
    const user2 = await prisma.user.create({
      data: {
        email: `u2-${Date.now()}@example.com`,
        displayName: '사용자2',
        provider: null,
      },
    });
    const user3 = await prisma.user.create({
      data: {
        email: `u3-${Date.now()}@example.com`,
        displayName: '삭제멤버',
        provider: null,
      },
    });
    created.userIds.push(user1.id, user2.id, user3.id);

    const issue = await prisma.issue.create({
      data: { title: `itest-issue-${Date.now()}` },
    });
    created.issueId = issue.id;

    const member1 = await prisma.issueMember.create({
      data: { issueId: issue.id, userId: user1.id },
    });
    const member2 = await prisma.issueMember.create({
      data: { issueId: issue.id, userId: user2.id },
    });
    const deletedMember = await prisma.issueMember.create({
      data: { issueId: issue.id, userId: user3.id, deletedAt: new Date() },
    });
    created.issueMemberIds.push(member1.id, member2.id, deletedMember.id);

    const category = await prisma.category.create({
      data: { issueId: issue.id, title: '카테고리' },
    });
    created.categoryIds.push(category.id);

    const idea1 = await prisma.idea.create({
      data: {
        issueId: issue.id,
        userId: user1.id,
        categoryId: category.id,
        content: '아이디어1',
      },
    });
    const idea2 = await prisma.idea.create({
      data: {
        issueId: issue.id,
        userId: user2.id,
        categoryId: category.id,
        content: '아이디어2',
      },
    });
    const deletedIdea = await prisma.idea.create({
      data: {
        issueId: issue.id,
        userId: user1.id,
        content: '삭제 아이디어',
        deletedAt: new Date(),
      },
    });
    created.ideaIds.push(idea1.id, idea2.id, deletedIdea.id);

    const comment1 = await prisma.comment.create({
      data: {
        ideaId: idea1.id,
        userId: user1.id,
        content: '댓글1',
      },
    });
    const deletedComment = await prisma.comment.create({
      data: {
        ideaId: idea1.id,
        userId: user1.id,
        content: '삭제 댓글',
        deletedAt: new Date(),
      },
    });
    const comment2 = await prisma.comment.create({
      data: {
        ideaId: idea2.id,
        userId: user2.id,
        content: '댓글2',
      },
    });
    created.commentIds.push(comment1.id, deletedComment.id, comment2.id);

    const vote1 = await prisma.vote.create({
      data: { ideaId: idea1.id, userId: user1.id, type: 'AGREE' },
    });
    const deletedVote = await prisma.vote.create({
      data: { ideaId: idea1.id, userId: user2.id, type: 'DISAGREE', deletedAt: new Date() },
    });
    created.voteIds.push(vote1.id, deletedVote.id);

    const report = await prisma.report.create({
      data: {
        issueId: issue.id,
        selectedIdeaId: idea1.id,
        memo: '메모',
      },
    });
    created.reportId = report.id;

    const result = await findReportWithDetailsById(issue.id);

    expect(result).not.toBeNull();
    expect(result?.issue.issueMembers).toHaveLength(2);
    expect(result?.issue.ideas).toHaveLength(2);

    const selectedIdea = result?.selectedIdea;
    expect(selectedIdea?.id).toBe(idea1.id);
    expect(selectedIdea?.comments).toHaveLength(1);

    const idea1Result = result?.issue.ideas.find((idea) => idea.id === idea1.id);
    expect(idea1Result?.votes).toHaveLength(1);
    expect(idea1Result?.comments).toHaveLength(1);
  });
});
