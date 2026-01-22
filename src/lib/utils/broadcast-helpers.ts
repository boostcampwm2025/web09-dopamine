import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { broadcast, getOnlineMemberIds } from '../sse/sse-service';

export const broadcastError = (issueId: string, message: string) => {
  broadcast({
    issueId,
    event: {
      type: SSE_EVENT_TYPES.AI_STRUCTURING_FAILED,
      data: { message },
    },
  });
};

export const broadcastMemberPresence = (issueId: string) => {
  const onlineUserIds = getOnlineMemberIds(issueId);

  broadcast({
    issueId,
    event: {
      type: SSE_EVENT_TYPES.MEMBER_PRESENCE,
      data: { onlineUserIds },
    },
  });
};
