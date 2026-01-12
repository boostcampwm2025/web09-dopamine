import redis from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { redisKeys } from '@/lib/redis-keys';
import { VoteType } from '@prisma/client';

type IssueStatus = 'BRAINSTORMING' | 'CATEGORIZE' | 'VOTE' | 'SELECT' | 'CLOSE';

type IssueData = {
    title: string;
    status: IssueStatus;
}

interface Props {
  issueId: string;
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
}

// 이슈 이관
async function transferIssue({issueId, tx}: Props) {
  // Redis에서 Issue 데이터 조회
  const issueData = await redis.hgetall(redisKeys.issue(issueId)) as IssueData;
  // Red(MySql)에서 기존 이슈 조회
  const existingIssue = await tx.issue.findUnique({
    where: { id: issueId },
  });

  if (!existingIssue) throw new Error('MySQL에 이슈가 존재하지 않습니다.');
  
  // Redis 정보로 업데이트(Redis가 MySql보다 항상 최신 상태임)
  await tx.issue.update({
    where: { id: issueId },
    data: {
      title: issueData.title,
      status: issueData.status,
    },
  });
}

// 카테고리 이관
async function transferCategories({issueId, tx}: Props) {
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
async function transferIdeas({issueId, tx}: Props) {
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

// 댓글 이관
async function transferComments({issueId, tx}: Props) {
  const ideaIds = await redis.smembers(redisKeys.issueIdeas(issueId));

  for (const ideaId of ideaIds) {
    const commentIds = await redis.lrange(redisKeys.ideaComments(ideaId), 0, -1);

    if (commentIds.length === 0) continue;

    // Pipeline으로 모든 댓글 데이터를 한 번에 조회
    const pipeline = redis.pipeline();
    commentIds.forEach(commentId => {
      pipeline.hgetall(redisKeys.comment(commentId));
    });
    const results = await pipeline.exec();

    if(!results) continue;

    // 결과 처리
    for (let i = 0; i < commentIds.length; i++) {
      const [err, commentData] = results[i];
      if (err) continue;
      
      const commentId = commentIds[i];
      const comment = commentData as Record<string, string>;

      // 빈 내용 제외
      if (!comment.content) continue;

      const existingComment = await tx.comment.findUnique({
        where: { id: commentId },
      });

      const commentPayload = {
        ideaId,
        userId: comment.user_id || comment.userId,
        content: comment.content,
      };

      if (!existingComment) {
        await tx.comment.create({
          data: {
            id: commentId,
            ...commentPayload,
          },
        });
      } else {
        await tx.comment.update({
          where: { id: commentId },
          data: commentPayload,
        });
      }
    }
  }
}

// 투표 이관
async function transferVotes({issueId, tx}: Props) {
  const ideaIds = await redis.smembers(redisKeys.issueIdeas(issueId));

  for (const ideaId of ideaIds) {
    // 투표한 사용자 목록 조회
    const userIds = await redis.smembers(redisKeys.ideaVoteUsers(ideaId));

    if (userIds.length === 0) continue;

    // Pipeline으로 모든 투표 데이터를 한 번에 조회
    const pipeline = redis.pipeline();
    userIds.forEach(userId => {
      pipeline.hgetall(redisKeys.userVote(ideaId, userId));
    });
    const results = await pipeline.exec();

    if(!results) continue;

    // 결과 처리
    for (let i = 0; i < userIds.length; i++) {
      const [err, voteData] = results[i];
      if (err) continue;
      
      const userId = userIds[i];
      const vote = voteData as Record<string, string>;

      // 투표 데이터가 없으면 스킵
      if (!vote.type) continue;

      const existingVote = await tx.vote.findFirst({
        where: {
          ideaId,
          userId,
          deletedAt: null,
        },
      });

      const votePayload = {
        ideaId,
        userId,
        type: (vote.type === 'UP' ? VoteType.UP : VoteType.DOWN) as VoteType,
      };

      if (!existingVote) {
        await tx.vote.create({
          data: votePayload,
        });
      } else {
        await tx.vote.update({
          where: { id: existingVote.id },
          data: { type: votePayload.type },
        });
      }
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
    await transferIssue({issueId, tx});
    await transferCategories({issueId, tx});
    await transferIdeas({issueId, tx});
    await transferComments({issueId, tx});
    await transferVotes({issueId, tx});
  });
}
