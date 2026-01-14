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

export interface BroadcastingEvent {
  issueId: string;
  event: SSEEvent;
}
