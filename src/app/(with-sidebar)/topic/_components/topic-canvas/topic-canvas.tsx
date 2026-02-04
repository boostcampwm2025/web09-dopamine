'use client';

import { memo, useMemo } from 'react';
import { MarkerType, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EDGE_STYLE } from '@/constants/topic';
import { useTopicEvents } from '@/hooks/topic/use-topic-events';
import { theme } from '@/styles/theme';
import { IssueConnection, IssueMapData, IssueNode } from '@/types/issue';
import TopicEdge from '../issue-connection/Issue-edge';
import TopicConnectionLine from '../issue-connection/issue-connection-line';
import { IssueHoverProvider } from '../issue-hover-context';
import TopicNode from '../issue-node/issue-node';
import { useTopicCanvas } from './use-topic-canvas';

interface TopicCanvasProps {
  topicId: string;
  issues: IssueMapData[];
  nodes: IssueNode[];
  connections: IssueConnection[];
}

// 리렌더링 방지를 위해 nodeTypes를 컴포넌트 외부에 선언
const nodeTypes = {
  topicNode: TopicNode,
};

const defaultEdgeOptions = {
  style: EDGE_STYLE,
  type: 'topicEdge',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: EDGE_STYLE.stroke,
  },
};

function TopicCanvas({ topicId, issues, nodes: issueNodes, connections }: TopicCanvasProps) {
  // 토픽 실시간 이벤트 수신
  useTopicEvents({ topicId });

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onConnectStart,
    onConnectEnd,
    deleteEdge,
    hoveredNodeId,
    connectedNodeIds,
  } = useTopicCanvas({
    topicId,
    initialIssues: issues,
    initialNodes: issueNodes,
    initialConnections: connections,
  });

  // edgeTypes를 동적으로 생성하여 onDelete prop 전달
  const edgeTypes = useMemo(
    () => ({
      topicEdge: (props: any) => (
        <TopicEdge
          {...props}
          onDelete={deleteEdge}
        />
      ),
    }),
    [deleteEdge],
  );

  const hoverContextValue = useMemo(
    () => ({
      hoveredNodeId,
      connectedNodeIds,
    }),
    [hoveredNodeId, connectedNodeIds],
  );

  return (
    <div
      style={{
        width: '100vw',
        flex: 1,
        backgroundColor: theme.colors.gray[50],
      }}
    >
      <IssueHoverProvider value={hoverContextValue}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          connectionLineComponent={TopicConnectionLine}
          onConnect={onConnect}
          defaultEdgeOptions={defaultEdgeOptions}
          fitViewOptions={{
            minZoom: 0.5,
            maxZoom: 1,
          }}
          fitView
          onlyRenderVisibleElements={true}
        />
      </IssueHoverProvider>
    </div>
  );
}

export default memo(TopicCanvas);
