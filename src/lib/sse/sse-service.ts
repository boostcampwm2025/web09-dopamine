import { sseManager } from '@/lib/sse/sse-manager';
import { BroadcastingEvent } from '@/types/sse';

// 브로드 캐스팅
export function broadcast({ issueId, event }: BroadcastingEvent): void {
  sseManager.broadcast({ issueId, event });
}
// 특정 이슈에 대한 연결된 클라이언트 수 조회
export function getConnectionCount(issueId: string): number {
  return sseManager.getConnectionCount(issueId);
}
// 전체 이슈에 대한 연결된 클라이언트 수 조회
export function getConnectionsInfo(): Record<string, number> {
  return sseManager.getConnectionsInfo();
}
