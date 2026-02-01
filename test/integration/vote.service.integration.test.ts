import { prisma } from '@/lib/prisma';
import { voteService } from '@/lib/services/vote.service';
import { VoteType } from '@prisma/client';

describe('voteService 통합 테스트 (동시성)', () => {
  const created = {
    userId: '' as string,
    issueId: '' as string,
    ideaId: '' as string,
  };

  beforeAll(async () => {
    await prisma.$queryRaw`SELECT 1`;
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 테스트 후 데이터 정리
  // 헬퍼: 테스트용 데이터 생성
  async function createTestData(postfix: string) {
    const user = await prisma.user.create({
      data: {
        email: `concurrent-${postfix}-${Date.now()}@example.com`,
        displayName: `테스터-${postfix}`,
      },
    });
    const issue = await prisma.issue.create({
      data: { title: `issue-${postfix}-${Date.now()}` },
    });
    const idea = await prisma.idea.create({
      data: {
        issueId: issue.id,
        userId: user.id,
        content: `idea-${postfix}`,
        agreeCount: 0,
        disagreeCount: 0,
      },
    });
    // 나중에 삭제하기 위해 ID 저장 (배열에 누적)
    createdIds.push({ userId: user.id, issueId: issue.id, ideaId: idea.id });
    return { user, idea };
  }

  // 삭제해야 할 ID들을 관리하는 배열
  const createdIds: Array<{ userId: string; issueId: string; ideaId: string }> = [];

  afterEach(async () => {
    // 생성된 역순으로 삭제
    for (const item of createdIds.reverse()) {
      try {
        await prisma.idea.deleteMany({ where: { id: item.ideaId } });
        await prisma.issue.deleteMany({ where: { id: item.issueId } });
        await prisma.user.deleteMany({ where: { id: item.userId } });
      } catch (e) {
        // 무시 (다른 테스트 영향 최소화)
      }
    }
    // 배열 초기화
    createdIds.length = 0;
  });

  it('동일 유저가 동시에 같은 투표(AGREE)를 시도하면 하나만 반영되어야 한다', async () => {
    const { user, idea } = await createTestData('AGREE');

    // 3번 동시 요청
    const requests = [
      voteService.castVote(idea.id, user.id, VoteType.AGREE),
      voteService.castVote(idea.id, user.id, VoteType.AGREE),
      voteService.castVote(idea.id, user.id, VoteType.AGREE),
    ];

    await Promise.allSettled(requests);

    // 검증
    const voteCount = await prisma.vote.count({
      where: { ideaId: idea.id, userId: user.id, type: VoteType.AGREE, deletedAt: null },
    });
    const updatedIdea = await prisma.idea.findUnique({ where: { id: idea.id } });

    expect(voteCount).toBe(1);
    expect(updatedIdea?.agreeCount).toBe(1);
    expect(updatedIdea?.disagreeCount).toBe(0);
  });

  it('동일 유저가 동시에 같은 투표(DISAGREE)를 시도하면 하나만 반영되어야 한다', async () => {
    const { user, idea } = await createTestData('DISAGREE');

    const requests = [
      voteService.castVote(idea.id, user.id, VoteType.DISAGREE),
      voteService.castVote(idea.id, user.id, VoteType.DISAGREE),
      voteService.castVote(idea.id, user.id, VoteType.DISAGREE),
    ];

    await Promise.allSettled(requests);

    const voteCount = await prisma.vote.count({
      where: { ideaId: idea.id, userId: user.id, type: VoteType.DISAGREE, deletedAt: null },
    });
    const updatedIdea = await prisma.idea.findUnique({ where: { id: idea.id } });

    expect(voteCount).toBe(1);
    expect(updatedIdea?.disagreeCount).toBe(1);
    expect(updatedIdea?.agreeCount).toBe(0);
  });

  it('동일 유저가 동시에 섞어서(AGREE/DISAGREE) 요청하면 최종적으로 정합성이 맞아야 한다', async () => {
    const { user, idea } = await createTestData('MIXED');

    // AGREE 3번, DISAGREE 2번을 동시 다발적으로 요청
    const actions = [
      VoteType.AGREE,
      VoteType.DISAGREE,
      VoteType.AGREE,
      VoteType.DISAGREE,
      VoteType.AGREE,
    ];

    const requests = actions.map((type) => voteService.castVote(idea.id, user.id, type));
    await Promise.allSettled(requests);

    // 최종 검증: 
    // 1. Vote 테이블: 활성 상태인 투표는 0개 또는 1개여야 함 (여러 개면 버그)
    const activeVotes = await prisma.vote.findMany({
      where: { ideaId: idea.id, userId: user.id, deletedAt: null },
    });
    expect(activeVotes.length).toBeLessThanOrEqual(1);

    // 2. 집계 검증: 
    // vote가 있으면 해당 타입 count=1, 나머지는 0
    // vote가 없으면(취소됨) 둘 다 0
    const updatedIdea = await prisma.idea.findUnique({ where: { id: idea.id } });

    if (activeVotes.length === 1) {
      const type = activeVotes[0].type;
      if (type === VoteType.AGREE) {
        expect(updatedIdea?.agreeCount).toBe(1);
        expect(updatedIdea?.disagreeCount).toBe(0);
      } else {
        expect(updatedIdea?.agreeCount).toBe(0);
        expect(updatedIdea?.disagreeCount).toBe(1);
      }
    } else {
      expect(updatedIdea?.agreeCount).toBe(0);
      expect(updatedIdea?.disagreeCount).toBe(0);
    }
  });
});
