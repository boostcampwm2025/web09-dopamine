export interface SSEEvent {
  type: string;
  data: any;
}

export interface SSEConnectionInfo {
  issueId: string;
  userId: string | null;
}

export interface SSEManagerStats {
  [issueId: string]: number;
}

export interface CreateStreamParams {
  issueId: string;
  userId: string | null;
  signal: AbortSignal;
}

export class SSEManager {
  private connections = new Map<string, Set<ReadableStreamDefaultController>>();

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
        this.connections.get(issueId)!.add(controller); // SET에 넣기

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
            issueConnections.delete(controller);
            // 이 이슈에 연결된 클라이언트가 없으면 Map에서 제거
            if (issueConnections.size === 0) {
              this.connections.delete(issueId);
            }
          }

          try {
            controller.close();
          } catch (error) {
            // 이미 닫힌 경우 무시
          }
        });
      },
    });
  }

  getConnectionCount(issueId: string): number {
    return this.connections.get(issueId)?.size ?? 0;
  }

  getConnectionsInfo(): SSEManagerStats {
    const info: SSEManagerStats = {};
    this.connections.forEach((connections, issueId) => {
      info[issueId] = connections.size;
    });
    return info;
  }
}

// 싱글톤 인스턴스 export
export const sseManager = new SSEManager();
