import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { BroadcastingEvent, CreateStreamParams } from '@/types/sse';
import { broadcastMemberPresence } from '../utils/broadcast-helpers';

interface ConnectedClient {
  userId: string;
  connectionId: string;         // 각 SSE 연결을 식별하기 위한 고유 ID
  activeIdeaId: string | null;  // 현재 클라이언트가 열어둔 댓글창의 Idea ID
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

        // 현재 컨트롤러를 연결 목록에 추가
        map.get(key)!.add({ userId, connectionId, activeIdeaId: null, controller });

        console.log(
          `[SSE] ${label} 클라이언트 연결됨 - ${keyName}: ${key}, User: ${userId}, ConnectionId: ${connectionId}`,
        );

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
          }
        }, 30000);

        // 연결 종료 처리
        signal.addEventListener('abort', () => {
          console.log(`[SSE] ${label} 클라이언트 연결 종료됨 - ${keyName}: ${key}, User: ${userId}`);
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
  ): void {
    if (!clients || clients.size === 0) {
      console.log(`[SSE] ${label}에 연결된 유저가 없습니다 ID: ${id}`);
      return;
    }

    const encoder = new TextEncoder();
    const message = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
    const encoded = encoder.encode(message);

    console.log(
      `[SSE] ${clients.size}개의 ${label} client에게 브로드캐스팅 - ID: ${id}, Event: ${event.type}`,
    );

    clients.forEach((client) => {
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
  broadcastToIssue({ issueId, event }: BroadcastingEvent): void {
    const clients = this.connections.get(issueId);
    this.broadcastToClients(clients, issueId, event, '이슈');
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
  }: {
    topicId: string;
    event: BroadcastingEvent['event'];
  }): void {
    const clients = this.topicConnections.get(topicId);
    this.broadcastToClients(clients, topicId, event, '토픽');
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

  // 특정 커넥션의 활성 아이디어 ID 업데이트
  updateActiveIdea(issueId: string, connectionId: string, ideaId: string | null): void {
    const clients = this.connections.get(issueId);
    if (!clients) return;

    for (const client of clients) {
      if (client.connectionId === connectionId) {
        client.activeIdeaId = ideaId;
        console.log(`[SSE] Client ${connectionId} activeIdeaId updated to ${ideaId}`);
        break;
      }
    }
  }
}

export const sseManager = new SSEManager();
