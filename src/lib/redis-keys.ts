export const redisKeys = {
  issue: (issueId: string) => `issue:${issueId}`,
  issueUser: (issueId: string, userId: string) => `issue:${issueId}:user:${userId}`,
  issueIdeas: (issueId: string) => `issue:${issueId}:ideas`,
  issueCategories: (issueId: string) => `issue:${issueId}:categories`,
  idea: (ideaId: string) => `idea:${ideaId}`,
  ideaComments: (ideaId: string) => `idea:${ideaId}:comments`,
  category: (categoryId: string) => `category:${categoryId}`,
  categoryIdeas: (categoryId: string) => `category:${categoryId}:ideas`,
  voteCount: (issueId: string, ideaId: string) => `vote:${issueId}:${ideaId}`,
  ideaVoteUsers: (ideaId: string) => `idea:${ideaId}:votes:users`,
  userVote: (ideaId: string, userId: string) => `vote:${ideaId}:user:${userId}`,
  comment: (commentId: string) => `comment:${commentId}`,
};
