import { prisma } from '@/lib/prisma';
import { createIssue, findIssuesWithMapDataByTopicId } from '@/lib/repositories/issue.repository';

describe('issue.repository 통합 테스트', () => {
  const created = {
    userId: '' as string,
    projectId: '' as string,
    topicId: '' as string,
    issueIds: [] as string[],
  };

  beforeAll(async () => {
    // 역할: DB 연결이 정상인지 미리 확인해 테스트 중간 실패를 줄인다.
    await prisma.$queryRaw`SELECT 1`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    if (created.issueIds.length > 0) {
      await prisma.issueConnection.deleteMany({
        where: {
          OR: [
            { sourceIssueId: { in: created.issueIds } },
            { targetIssueId: { in: created.issueIds } },
          ],
        },
      });
      await prisma.issueNode.deleteMany({ where: { issueId: { in: created.issueIds } } });
      await prisma.issue.deleteMany({ where: { id: { in: created.issueIds } } });
      created.issueIds = [];
    }

    if (created.topicId) {
      await prisma.topic.deleteMany({ where: { id: created.topicId } });
      created.topicId = '';
    }

    if (created.projectId) {
      await prisma.project.deleteMany({ where: { id: created.projectId } });
      created.projectId = '';
    }

    if (created.userId) {
      await prisma.user.deleteMany({ where: { id: created.userId } });
      created.userId = '';
    }
  });

  it('토픽 ID로 이슈/연결 정보를 함께 조회한다', async () => {
    //given
    const user = await prisma.user.create({
      data: {
        email: `itest-${Date.now()}@example.com`,
        displayName: '테스터',
        provider: null,
      },
    });
    created.userId = user.id;

    const project = await prisma.project.create({
      data: {
        title: `itest-project-${Date.now()}`,
        ownerId: user.id,
      },
    });
    created.projectId = project.id;

    const topic = await prisma.topic.create({
      data: {
        projectId: project.id,
        title: '테스트 토픽',
      },
    });
    created.topicId = topic.id;

    const issueA = await prisma.$transaction((tx) => createIssue(tx, 'Issue A', topic.id));
    const issueB = await prisma.$transaction((tx) => createIssue(tx, 'Issue B', topic.id));
    created.issueIds.push(issueA.id, issueB.id);

    const connection = await prisma.issueConnection.create({
      data: {
        sourceIssueId: issueA.id,
        targetIssueId: issueB.id,
        sourceHandle: 'right',
        targetHandle: 'left',
      },
    });

    // when
    const result = await findIssuesWithMapDataByTopicId(topic.id);

    // then
    const issueIds = result.issues.map((item) => item.id).sort();
    expect(issueIds).toEqual([issueA.id, issueB.id].sort());
    expect(result.issues.every((item) => item.issueNode)).toBe(true);
    expect(result.connections.map((item) => item.id)).toEqual([connection.id]);
  });
});
