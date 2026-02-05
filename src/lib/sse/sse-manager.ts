import { BroadcastingEvent, CreateStreamParams } from '@/types/sse';
import { broadcastMemberPresence } from '../utils/broadcast-helpers';

interface ConnectedClient {
  userId: string;
  connectionId: string; // 각 SSE 연결을 식별하기 위한 고유 ID
  controller: ReadableStreamDefaultController;
}

export class SSEManager {
  private connections = new Map<string, Set<ConnectedClient>>();
  private topicConnections = new Map<string, Set<ConnectedClient>>();

  /**
   * 공통 스트림 생성 메서드
   */
  private createSSEStream({
    key,
    keyName,
    userId,
    signal,
    map,
    label,
    onConnect,
    onDisconnect,
  }: {
    key: string;
    keyName: 'issueId' | 'topicId';
    userId: string;
    signal: AbortSignal;
    map: Map<string, Set<ConnectedClient>>;
    label: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
  }): ReadableStream {
    const encoder = new TextEncoder();
    const connectionId = crypto.randomUUID();

    return new ReadableStream({
      start: (controller) => {
        // 연결 Set이 없으면 생성
        if (!map.has(key)) {
          map.set(key, new Set());
        }

        // 같은 userId의 기존 연결 종료 (새로고침 등으로 인한 중복 방지)
        const existingClients = map.get(key)!;
        const staleClients: ConnectedClient[] = [];
        for (const client of existingClients) {
          if (client.userId === userId) {
            staleClients.push(client);
          }
        }
        for (const staleClient of staleClients) {
          existingClients.delete(staleClient);
          try {
            staleClient.controller.close();
          } catch {
            // 이미 닫힌 경우 무시
          }
        }

        // 현재 컨트롤러를 연결 목록에 추가
        existingClients.add({ userId, connectionId, controller });
        // 연결 확인 메시지
        const connectMessage = `data: ${JSON.stringify({
          type: 'connected',
          connectionId,
          [keyName]: key,
          timestamp: new Date().toISOString(),
        })}\n\n`;

        // 스트림 버퍼로 인큐
        controller.enqueue(encoder.encode(connectMessage));

        // 추가 연결 동작 (ex. Presence 알림)
        if (onConnect) onConnect();

        // 하트비트 (30초마다 연결 유지)
        const heartbeatInterval = setInterval(() => {
          try {
            // 앞에 ":"를 붙이면 클라이언트에서는 주석으로 보고 무시함
            const heartbeat = `:heartbeat\n\n`;
            controller.enqueue(encoder.encode(heartbeat));
          } catch (error) {
            console.error(`[SSE] ${label} Heartbeat error:`, error);
            clearInterval(heartbeatInterval);

            // 하트비트 실패 시 연결 맵에서도 제거
            const clients = map.get(key);
            if (clients) {
              for (const client of clients) {
                if (client.controller === controller) {
                  clients.delete(client);
                  break;
                }
              }
              if (clients.size === 0) {
                map.delete(key);
              }
            }
          }
        }, 30000);

        // 연결 종료 처리
        signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval);

          const clients = map.get(key);
          if (clients) {
            for (const client of clients) {
              if (client.controller === controller) {
                clients.delete(client);
                break;
              }
            }
            if (clients.size === 0) {
              map.delete(key);
            }
          }

          if (onDisconnect) onDisconnect();

          try {
            controller.close();
          } catch (error) {
            // 이미 닫힌 경우 무시
          }
        });
      },
    });
  }

  /**
   * 공통 브로드캐스트 메서드
   */
  private broadcastToClients(
    clients: Set<ConnectedClient> | undefined,
    id: string,
    event: BroadcastingEvent['event'],
    label: string,
    excludeConnectionId?: string,
  ): void {
    if (!clients || clients.size === 0) {
      return;
    }

    const encoder = new TextEncoder();
    const message = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
    const encoded = encoder.encode(message);

    clients.forEach((client) => {
      // 제외할 커넥션 ID(보낸 사람 자신)일경우 skip
      if (excludeConnectionId && client.connectionId === excludeConnectionId) return;

      try {
        client.controller.enqueue(encoded);
      } catch (error) {
        console.error(`[SSE] Failed to send ${label} message:`, error);
        clients.delete(client);
      }
    });
  }

  // 이슈 연결 생성
  createStream({ issueId, userId, signal }: CreateStreamParams): ReadableStream {
    return this.createSSEStream({
      key: issueId,
      keyName: 'issueId',
      userId,
      signal,
      map: this.connections,
      label: '이슈',
      onConnect: () => broadcastMemberPresence(issueId),
      onDisconnect: () => broadcastMemberPresence(issueId),
    });
  }

  // 이슈 브로드캐스트
  broadcastToIssue({ issueId, event, excludeConnectionId }: BroadcastingEvent): void {
    const clients = this.connections.get(issueId);
    this.broadcastToClients(clients, issueId, event, '이슈', excludeConnectionId);
  }

  // 토픽 연결 생성
  createTopicStream({
    topicId,
    userId,
    signal,
  }: {
    topicId: string;
    userId: string;
    signal: AbortSignal;
  }): ReadableStream {
    return this.createSSEStream({
      key: topicId,
      keyName: 'topicId',
      userId,
      signal,
      map: this.topicConnections,
      label: '토픽',
    });
  }

  // 토픽 브로드캐스트
  broadcastToTopic({
    topicId,
    event,
    excludeConnectionId,
  }: {
    topicId: string;
    event: BroadcastingEvent['event'];
    excludeConnectionId?: string;
  }): void {
    const clients = this.topicConnections.get(topicId);
    this.broadcastToClients(clients, topicId, event, '토픽', excludeConnectionId);
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

  getOnlineMemberIds(issueId: string): string[] {
    const clients = this.connections.get(issueId);

    if (!clients) {
      return [];
    }

    const userIds = Array.from(clients).map((client) => client.userId);
    return Array.from(new Set(userIds));
  }
}

export const sseManager = new SSEManager();
