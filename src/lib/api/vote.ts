import getAPIResponseData from '@/lib/utils/api-response';

type VoteRequest = {
  issueId: string;
  ideaId: string;
  userId: string;
  voteType: 'AGREE' | 'DISAGREE';
};

export type VoteResponse = {
  agreeCount: number;
  disagreeCount: number;
  myVote: 'AGREE' | 'DISAGREE' | null; // 취소되면 null이 올 수 있음
};

export const postVote = async ({
  issueId,
  ideaId,
  userId,
  voteType,
}: VoteRequest): Promise<VoteResponse> => {
  return getAPIResponseData<VoteResponse>({
    url: `/api/issues/${issueId}/ideas/${ideaId}/vote`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      voteType,
    }),
  });
};
