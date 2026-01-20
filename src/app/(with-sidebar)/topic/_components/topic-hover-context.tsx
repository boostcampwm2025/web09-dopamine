import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

type TopicHoverContextValue = {
  hoveredNodeId: string | null;
  connectedNodeIds: ReadonlySet<string>;
};

const EMPTY_CONNECTED_NODE_IDS = new Set<string>();

const TopicHoverContext = createContext<TopicHoverContextValue>({
  hoveredNodeId: null,
  connectedNodeIds: EMPTY_CONNECTED_NODE_IDS,
});

export function TopicHoverProvider({
  value,
  children,
}: {
  value: TopicHoverContextValue;
  children: ReactNode;
}) {
  return <TopicHoverContext.Provider value={value}>{children}</TopicHoverContext.Provider>;
}

export function useTopicHoverContext() {
  return useContext(TopicHoverContext);
}
