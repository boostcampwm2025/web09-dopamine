import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { BroadcastingEvent, CreateStreamParams } from '@/types/sse';

interface ConnectedClient {
  userId: string;
  controller: ReadableStreamDefaultController;
}

export class SSEManager {
  private connections = new Map<string, Set<ConnectedClient>>();

  // 연결 생성
  createStream({ issueId, userId, signal }: CreateStreamParams): ReadableStream {
    const encoder = new TextEncoder();

    return new ReadableStream({
      start: (controller) => {
        // 이 이슈에 대한 연결 Set이 없으면 생성(최초 이슈 생성 및 최초 연결 시)
        if (!this.connections.has(issueId)) {
          this.connections.set(issueId, new Set());
        }

        // 현재 컨트롤러를 연결 목록에 추가
        this.connections.get(issueId)!.add({ userId, controller }); // SET에 넣기

        // 임시 로깅
        console.log(`[SSE] 클라이언트 연결됨 - Issue: ${issueId}, User: ${userId}`);

        // 연결 확인 메시지
        const connectMessage = `data: ${JSON.stringify({
          type: 'connected',
          issueId,
          timestamp: new Date().toISOString(),
        })}\n\n`; // SSE 표준 포멧

        // 스트림 버퍼로 인큐
        controller.enqueue(encoder.encode(connectMessage));

        const onlineUserIds = this.getConnectMemberIds(issueId);

        this.broadcast({
          issueId,
          event: {
            type: SSE_EVENT_TYPES.USER_PRESENCE,
            data: { connectedUserIds: onlineUserIds },
          },
        });

        // 하트비트 (30초마다 연결 유지)
        // 프록시가 연결을 끊지 않도록 방지
        const heartbeatInterval = setInterval(() => {
          try {
            // 앞에 ":"를 붙이면 클라이언트에서는 주석으로 보고 무시함
            const heartbeat = `:heartbeat\n\n`;
            controller.enqueue(encoder.encode(heartbeat));
          } catch (error) {
            console.error('[SSE] Heartbeat error:', error);
            clearInterval(heartbeatInterval);
          }
        }, 30000);

        // 연결 종료 처리
        signal.addEventListener('abort', () => {
          console.log(`[SSE] 클라이언트 연결 종료됨 - Issue: ${issueId}, User: ${userId}`);
          clearInterval(heartbeatInterval);

          // 연결 목록에서 제거
          const issueConnections = this.connections.get(issueId);
          if (issueConnections) {
            for (const client of issueConnections) {
              // 현재 끊어진 컨트롤러와 일치하는 객체를 찾음
              if (client.controller === controller) {
                issueConnections.delete(client); // 그 객체 자체를 삭제
                break; // 찾았으면 루프 종료
              }
            }
            // 이 이슈에 연결된 클라이언트가 없으면 Map에서 제거
            if (issueConnections.size === 0) {
              this.connections.delete(issueId);
            }
          }

          const onlineUserIds = this.getConnectMemberIds(issueId);

          this.broadcast({
            issueId,
            event: {
              type: SSE_EVENT_TYPES.USER_PRESENCE,
              data: { connectedUserIds: onlineUserIds },
            },
          });

          try {
            controller.close();
          } catch (error) {
            // 이미 닫힌 경우 무시
          }
        });
      },
    });
  }

  broadcast({ issueId, event }: BroadcastingEvent): void {
    const issueConnections = this.connections.get(issueId);

    if (!issueConnections || issueConnections.size === 0) {
      console.log(`[SSE] 이슈에 연결된 유저가 없습니다 Issue: ${issueId}`);
      return;
    }

    const encoder = new TextEncoder();
    const message = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
    const encoded = encoder.encode(message);

    console.log(
      `[SSE] ${issueConnections.size}개의 client에게 브로드캐스팅 - Issue: ${issueId}, Event: ${event.type}`,
    );

    issueConnections.forEach((client) => {
      try {
        client.controller.enqueue(encoded);
      } catch (error) {
        console.error('[SSE] Failed to send message:', error);
        issueConnections.delete(client);
      }
    });
  }

  getConnectionCount(issueId: string): number {
    return this.connections.get(issueId)?.size ?? 0;
  }

  getConnectionsInfo(): Record<string, number> {
    const info: Record<string, number> = {};
    this.connections.forEach((connections, issueId) => {
      info[issueId] = connections.size;
    });
    return info;
  }

  getConnectMemberIds(issueId: string): string[] {
    const clients = this.connections.get(issueId);

    if (!clients) {
      return [];
    }

    const userIds = Array.from(clients).map((client) => client.userId);
    return Array.from(new Set(userIds));
  }
}

export const sseManager = new SSEManager();
