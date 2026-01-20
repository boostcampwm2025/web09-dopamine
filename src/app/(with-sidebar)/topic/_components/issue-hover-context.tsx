import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

type IssueHoverContextValue = {
  hoveredNodeId: string | null;
  connectedNodeIds: ReadonlySet<string>;
};

const EMPTY_CONNECTED_NODE_IDS = new Set<string>();

const IssueHoverContext = createContext<IssueHoverContextValue>({
  hoveredNodeId: null,
  connectedNodeIds: EMPTY_CONNECTED_NODE_IDS,
});

export function IssueHoverProvider({
  value,
  children,
}: {
  value: IssueHoverContextValue;
  children: ReactNode;
}) {
  return <IssueHoverContext.Provider value={value}>{children}</IssueHoverContext.Provider>;
}

export function useTopicHoverContext() {
  return useContext(IssueHoverContext);
}
