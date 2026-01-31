require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const buildPrismaClient = () => {
  const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_PORT, DATABASE_URL } = process.env;

  if (DB_HOST && DB_USERNAME && DB_PASSWORD && DB_NAME) {
    const adapterOptions = {
      host: DB_HOST,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      connectionLimit: 5,
    };

    const port = Number(DB_PORT);
    if (Number.isFinite(port)) {
      adapterOptions.port = port;
    }

    return new PrismaClient({
      adapter: new PrismaMariaDb(adapterOptions),
    });
  }

  if (!DATABASE_URL) {
    throw new Error(
      'Missing DB connection settings. Set DB_HOST/DB_USERNAME/DB_PASSWORD/DB_NAME or DATABASE_URL.',
    );
  }

  return new PrismaClient({ datasourceUrl: DATABASE_URL });
};

const prisma = buildPrismaClient();

const ids = {
  userAlice: '00000000-0000-0000-0000-000000000001',
  userBob: '00000000-0000-0000-0000-000000000002',
  userCharlie: '00000000-0000-0000-0000-000000000003',
  projectAlpha: '00000000-0000-0000-0000-000000000101',
  topicProduct: '00000000-0000-0000-0000-000000000201',
  topicGrowth: '00000000-0000-0000-0000-000000000202',
  issueRetention: '00000000-0000-0000-0000-000000000301',
  issueActivation: '00000000-0000-0000-0000-000000000302',
  issueLink: '00000000-0000-0000-0000-000000000401',
  categoryIdeas: '00000000-0000-0000-0000-000000000501',
  categoryRisks: '00000000-0000-0000-0000-000000000502',
  ideaA: '00000000-0000-0000-0000-000000000601',
  ideaB: '00000000-0000-0000-0000-000000000602',
  ideaC: '00000000-0000-0000-0000-000000000603',
  commentA: '00000000-0000-0000-0000-000000000701',
  commentB: '00000000-0000-0000-0000-000000000702',
  voteA: '00000000-0000-0000-0000-000000000801',
  voteB: '00000000-0000-0000-0000-000000000802',
  projectMemberBob: '00000000-0000-0000-0000-000000000901',
  projectMemberCharlie: '00000000-0000-0000-0000-000000000902',
  issueOwnerAlice: '00000000-0000-0000-0000-000000000903',
  issueMemberBob: '00000000-0000-0000-0000-000000000904',
};

const upsertById = async (delegate, record) => {
  const { id, ...data } = record;
  return delegate.upsert({
    where: { id },
    update: data,
    create: record,
  });
};

async function main() {
  const users = [
    {
      id: ids.userAlice,
      email: 'alice@example.com',
      name: 'Alice',
      displayName: 'alice',
      provider: 'github',
      provider: 'github',
      image: 'https://example.com/avatar/alice.png',
    },
    {
      id: ids.userBob,
      email: 'bob@example.com',
      name: 'Bob',
      displayName: 'bob',
      provider: 'google',
      provider: 'google',
      image: 'https://example.com/avatar/bob.png',
    },
    {
      id: ids.userCharlie,
      email: 'charlie@example.com',
      name: 'Charlie',
      displayName: 'charlie',
      provider: 'kakao',
      provider: 'kakao',
      image: 'https://example.com/avatar/charlie.png',
    },
  ];

  for (const user of users) {
    await upsertById(prisma.user, user);
  }

  await upsertById(prisma.project, {
    id: ids.projectAlpha,
    ownerId: ids.userAlice,
    title: 'Dopamine Alpha',
    description: 'Seed project for local development',
  });

  const projectMembers = [
    {
      id: ids.projectMemberBob,
      userId: ids.userBob,
      projectId: ids.projectAlpha,
    },
    {
      id: ids.projectMemberCharlie,
      userId: ids.userCharlie,
      projectId: ids.projectAlpha,
    },
  ];

  for (const member of projectMembers) {
    await upsertById(prisma.projectMember, member);
  }

  const topics = [
    {
      id: ids.topicProduct,
      projectId: ids.projectAlpha,
      title: 'Product',
    },
    {
      id: ids.topicGrowth,
      projectId: ids.projectAlpha,
      title: 'Growth',
    },
  ];

  for (const topic of topics) {
    await upsertById(prisma.topic, topic);
  }

  const issues = [
    {
      id: ids.issueRetention,
      topicId: ids.topicProduct,
      title: 'Improve retention',
      status: 'BRAINSTORMING',
    },
    {
      id: ids.issueActivation,
      topicId: ids.topicGrowth,
      title: 'Boost activation rate',
      status: 'VOTE',
    },
  ];

  for (const issue of issues) {
    await upsertById(prisma.issue, issue);
  }

  await upsertById(prisma.issueConnection, {
    id: ids.issueLink,
    sourceIssueId: ids.issueRetention,
    targetIssueId: ids.issueActivation,
  });

  const issueMembers = [
    {
      id: ids.issueOwnerAlice,
      issueId: ids.issueRetention,
      userId: ids.userAlice,
      role: 'OWNER',
      nickname: 'Alice',
    },
    {
      id: ids.issueMemberBob,
      issueId: ids.issueActivation,
      userId: ids.userBob,
      role: 'MEMBER',
      nickname: 'Bob',
    },
  ];

  for (const member of issueMembers) {
    await upsertById(prisma.issueMember, member);
  }

  const categories = [
    {
      id: ids.categoryIdeas,
      issueId: ids.issueRetention,
      title: 'Ideas',
      positionX: 120,
      positionY: 80,
      width: 320,
      height: 200,
    },
    {
      id: ids.categoryRisks,
      issueId: ids.issueActivation,
      title: 'Risks',
      positionX: 520,
      positionY: 80,
      width: 280,
      height: 200,
    },
  ];

  for (const category of categories) {
    await upsertById(prisma.category, category);
  }

  const ideas = [
    {
      id: ids.ideaA,
      issueId: ids.issueRetention,
      userId: ids.userBob,
      categoryId: ids.categoryIdeas,
      content: 'Add a weekly recap email with wins and next steps.',
      positionX: 160,
      positionY: 140,
    },
    {
      id: ids.ideaB,
      issueId: ids.issueRetention,
      userId: ids.userCharlie,
      categoryId: null,
      content: 'Introduce a lightweight onboarding checklist.',
      positionX: 260,
      positionY: 200,
    },
    {
      id: ids.ideaC,
      issueId: ids.issueActivation,
      userId: ids.userAlice,
      categoryId: ids.categoryRisks,
      content: 'Run a 3-step activation tour on first login.',
      positionX: 560,
      positionY: 140,
    },
  ];

  for (const idea of ideas) {
    await upsertById(prisma.idea, idea);
  }

  const comments = [
    {
      id: ids.commentA,
      ideaId: ids.ideaA,
      userId: ids.userAlice,
      content: 'We should A/B test the subject line.',
    },
    {
      id: ids.commentB,
      ideaId: ids.ideaC,
      userId: ids.userBob,
      content: 'Keep the tour under 60 seconds.',
    },
  ];

  for (const comment of comments) {
    await upsertById(prisma.comment, comment);
  }

  const votes = [
    {
      id: ids.voteA,
      ideaId: ids.ideaA,
      userId: ids.userAlice,
      type: 'AGREE',
    },
    {
      id: ids.voteB,
      ideaId: ids.ideaC,
      userId: ids.userBob,
      type: 'DISAGREE',
    },
  ];

  for (const vote of votes) {
    await upsertById(prisma.vote, vote);
  }

  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
