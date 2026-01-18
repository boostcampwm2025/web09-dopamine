import getAPIResponseData from '@/lib/utils/api-response';

type VoteRequest = {
  ideaId: string;
  userId: string;
  voteType: 'AGREE' | 'DISAGREE';
};

export type VoteResponse = {
  agreeCount: number;
  disagreeCount: number;
  myVote: 'AGREE' | 'DISAGREE' | null; // 취소되면 null이 올 수 있음
};

export const postVote = async ({ ideaId, userId, voteType }: VoteRequest): Promise<VoteResponse> => {
  return getAPIResponseData<VoteResponse>({
    url: `/api/ideas/${ideaId}/vote`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      voteType,
    }),
  });
};
