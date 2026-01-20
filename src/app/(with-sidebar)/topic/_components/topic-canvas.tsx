'use client';

import { memo, useMemo } from 'react';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EDGE_STYLE } from '@/constants/topic';
import { IssueConnection, IssueMapData, IssueNode } from '@/types/issue';
import { useTopicCanvas } from '../_hooks/use-topic-canvas';
import TopicConnectionLine from './topic-connection-line';
import TopicEdge from './topic-edge';
import TopicNode from './topic-node';

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
};

function TopicCanvas({ topicId, issues, nodes: issueNodes, connections }: TopicCanvasProps) {
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
  } = useTopicCanvas({
    topicId,
    initialIssues: issues,
    initialNodes: issueNodes,
    initialConnections: connections,
  });

  // edgeTypes를 동적으로 생성하여 onDelete prop 전달
  const edgeTypes = useMemo(
    () => ({
      topicEdge: (props: any) => <TopicEdge {...props} onDelete={deleteEdge} />,
    }),
    [deleteEdge],
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
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
    </div>
  );
}

export default memo(TopicCanvas);
