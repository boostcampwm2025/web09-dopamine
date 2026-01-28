import { prisma } from '@/lib/prisma';
import { getProjectWithTopics } from '@/lib/repositories/project.repository';

describe('project.repository 통합 테스트', () => {
  const created = {
    userIds: [] as string[],
    projectId: '' as string,
    topicId: '' as string,
    issueIds: [] as string[],
    projectMemberIds: [] as string[],
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
      await prisma.issue.deleteMany({ where: { id: { in: created.issueIds } } });
      created.issueIds = [];
    }

    if (created.topicId) {
      await prisma.topic.deleteMany({ where: { id: created.topicId } });
      created.topicId = '';
    }

    if (created.projectMemberIds.length > 0) {
      await prisma.projectMember.deleteMany({ where: { id: { in: created.projectMemberIds } } });
      created.projectMemberIds = [];
    }

    if (created.projectId) {
      await prisma.project.deleteMany({ where: { id: created.projectId } });
      created.projectId = '';
    }

    if (created.userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: created.userIds } } });
      created.userIds = [];
    }
  });

  it('프로젝트 상세 조회 시 멤버/토픽/이슈 카운트가 정확히 계산된다', async () => {
    // given
    const owner = await prisma.user.create({
      data: {
        email: `owner-${Date.now()}@example.com`,
        displayName: '오너',
        provider: null,
      },
    });
    const member = await prisma.user.create({
      data: {
        email: `member-${Date.now()}@example.com`,
        displayName: '멤버',
        provider: null,
      },
    });
    const deletedMember = await prisma.user.create({
      data: {
        email: `deleted-${Date.now()}@example.com`,
        displayName: '삭제멤버',
        provider: null,
      },
    });
    created.userIds.push(owner.id, member.id, deletedMember.id);

    const project = await prisma.project.create({
      data: {
        title: `itest-project-${Date.now()}`,
        ownerId: owner.id,
      },
    });
    created.projectId = project.id;

    const pmOwner = await prisma.projectMember.create({
      data: { projectId: project.id, userId: owner.id },
    });
    const pmMember = await prisma.projectMember.create({
      data: { projectId: project.id, userId: member.id },
    });
    const pmDeleted = await prisma.projectMember.create({
      data: { projectId: project.id, userId: deletedMember.id, deletedAt: new Date() },
    });
    created.projectMemberIds.push(pmOwner.id, pmMember.id, pmDeleted.id);

    const topic = await prisma.topic.create({
      data: { projectId: project.id, title: '토픽' },
    });
    created.topicId = topic.id;

    const issueActive = await prisma.issue.create({
      data: { title: '활성 이슈', topicId: topic.id },
    });
    const issueDeleted = await prisma.issue.create({
      data: { title: '삭제 이슈', topicId: topic.id, deletedAt: new Date() },
    });
    created.issueIds.push(issueActive.id, issueDeleted.id);

    //when
    const result = await getProjectWithTopics(project.id);

    //then
    expect(result).not.toBeNull();
    expect(result?.topics).toEqual([{ id: topic.id, title: '토픽', issueCount: 1 }]);
    expect(result?.members).toEqual([
      { id: owner.id, name: '오너', image: null, role: 'OWNER' },
      { id: member.id, name: '멤버', image: null, role: 'MEMBER' },
    ]);
  });
});
