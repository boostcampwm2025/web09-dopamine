type HeadersValue = HeadersInit | undefined;

export const withSseHeader = (headers: HeadersValue, connectionId?: string) => {
  if (!connectionId) return headers;
  return {
    ...(headers ?? {}),
    'x-sse-connection-id': connectionId,
  } as HeadersInit;
};
