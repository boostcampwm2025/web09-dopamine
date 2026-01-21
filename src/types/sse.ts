import { SSEEventType } from '@/constants/sse-events';

export interface SSEEvent {
  type: SSEEventType;
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
  userId: string;
  signal: AbortSignal;
}

export interface BroadcastingEvent {
  issueId: string;
  event: SSEEvent;
}
