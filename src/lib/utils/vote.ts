import { VoteType } from '@prisma/client';

export function countField(t: VoteType) {
  return t === 'AGREE' ? 'agreeCount' : 'disagreeCount'
};
