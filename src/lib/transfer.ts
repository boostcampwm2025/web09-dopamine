import redis from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { redisKeys } from '@/lib/redis-keys';

type IssueStatus = 'BRAINSTORMING' | 'CATEGORIZE' | 'VOTE' | 'SELECT' | 'CLOSE';

type IssueData = {
    title: string;
    status: IssueStatus;
}

// 이슈 이관
async function transferIssue(
  issueId: string,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
) {
  const issueData = await redis.hgetall(redisKeys.issue(issueId)) as IssueData;

  const existingIssue = await tx.issue.findUnique({
    where: { id: issueId },
  });

  if (!existingIssue) {
    throw new Error('MySQL에 이슈가 존재하지 않습니다.');
  }

  // Redis 정보로 업데이트
  await tx.issue.update({
    where: { id: issueId },
    data: {
      title: issueData.title,
      status: issueData.status,
    },
  });
}

// 카테고리 이관
async function transferCategories(
  issueId: string,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
) {
  const categoryIds = await redis.smembers(redisKeys.issueCategories(issueId));

  for (const categoryId of categoryIds) {

    const categoryData = await redis.hgetall(redisKeys.category(categoryId));
    const existingCategory = await tx.category.findUnique({
      where: { id: categoryId },
    });

    const categoryPayload = {
      title: categoryData.title,
      positionX: categoryData.pos_x ? parseFloat(categoryData.pos_x) : null,
      positionY: categoryData.pos_y ? parseFloat(categoryData.pos_y) : null,
      width: categoryData.width ? parseFloat(categoryData.width) : null,
      height: categoryData.height ? parseFloat(categoryData.height) : null,
    };

    if (!existingCategory) {
      await tx.category.create({
        data: {
          id: categoryId,
          issueId,
          ...categoryPayload,
        },
      });
    } else {
      await tx.category.update({
        where: { id: categoryId },
        data: categoryPayload,
      });
    }
  }
}

// 아이디어 이관
async function transferIdeas(
  issueId: string,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
) {
  const ideaIds = await redis.smembers(redisKeys.issueIdeas(issueId));

  for (const ideaId of ideaIds) {
    const ideaData = await redis.hgetall(redisKeys.idea(ideaId));

    const existingIdea = await tx.idea.findUnique({
      where: { id: ideaId },
    });

    const ideaPayload = {
      userId: ideaData.user_id || ideaData.userId,
      categoryId: ideaData.category_id || null,
      content: ideaData.content,
      positionX: ideaData.pos_x ? parseFloat(ideaData.pos_x) : null,
      positionY: ideaData.pos_y ? parseFloat(ideaData.pos_y) : null,
    };

    if (!existingIdea) {
      await tx.idea.create({
        data: {
          id: ideaId,
          issueId,
          ...ideaPayload,
        },
      });
    } else {
      await tx.idea.update({
        where: { id: ideaId },
        data: ideaPayload,
      });
    }
  }
}

// redis에서 mysql로 이슈 데이터 이관
export async function transferIssueData(issueId: string) {
  // Redis에 이슈가 존재하는지 확인
  const issueExists = await redis.exists(redisKeys.issue(issueId));
  if (!issueExists) {
    throw new Error('이슈가 레디스에 존재하지 않습니다.');
  }

  // 트랜잭션으로 모든 데이터 이관
  await prisma.$transaction(async (tx) => {
    await transferIssue(issueId, tx);
    await transferCategories(issueId, tx);
    await transferIdeas(issueId, tx);

    // TODO: 댓글 이관
    // TODO: 투표 이관
  });
}
