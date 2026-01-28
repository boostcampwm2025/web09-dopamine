import { sseManager } from '@/lib/sse/sse-manager';
import { BroadcastingEvent } from '@/types/sse';

// 브로드 캐스팅
export function broadcast({ issueId, event }: BroadcastingEvent) {
  sseManager.broadcastToIssue({ issueId, event });
}

// 토픽 레벨 브로드캐스팅
export function broadcastToTopic({
  topicId,
  event,
}: {
  topicId: string;
  event: BroadcastingEvent['event'];
}) {
  sseManager.broadcastToTopic({ topicId, event });
}

// 특정 이슈에 대한 연결된 클라이언트 수 조회
export function getConnectionCount(issueId: string): number {
  return sseManager.getConnectionCount(issueId);
}
// 전체 이슈에 대한 연결된 클라이언트 수 조회
export function getConnectionsInfo(): Record<string, number> {
  return sseManager.getConnectionsInfo();
}
// 특정 이슈에 대한 연결된 클라이언트의 ID 조회
export function getOnlineMemberIds(issueId: string): string[] {
  return sseManager.getOnlineMemberIds(issueId);
}
// 특정 커넥션의 활성 아이디어 ID 업데이트 (댓글 타겟 브로드캐스팅용)
export function updateActiveIdea(
  issueId: string,
  connectionId: string,
  ideaId: string | null,
): void {
  sseManager.updateActiveIdea(issueId, connectionId, ideaId);
}
