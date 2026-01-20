'use client';

import { memo } from 'react';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EDGE_STYLE } from '@/constants/topic';
import { IssueConnection, IssueMapData, IssueNode } from '@/types/issue';
import { useTopicCanvas } from '../_hooks/use-topic-canvas';
import TopicConnectionLine from './topic-connection-line';
import TopicEdge from './topic-edge';
import TopicNode from './topic-node';

interface TopicCanvasProps {
  issues: IssueMapData[];
  nodes: IssueNode[];
  connections: IssueConnection[];
}

// 리렌더링 방지를 위해 nodeTypes와 edgeTypes를 컴포넌트 외부에 선언
const nodeTypes = {
  topicNode: TopicNode,
};

const edgeTypes = {
  topicEdge: TopicEdge,
};

const defaultEdgeOptions = {
  style: EDGE_STYLE,
  type: 'topicEdge',
};

function TopicCanvas({ issues, nodes: issueNodes, connections }: TopicCanvasProps) {
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
  } = useTopicCanvas({ issues, nodes: issueNodes, connections });

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
