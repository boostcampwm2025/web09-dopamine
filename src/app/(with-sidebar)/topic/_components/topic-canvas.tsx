'use client';

import { useCallback, useMemo, useState } from 'react';
import { Node, ReactFlow, addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ISSUE_STATUS } from '@/constants/issue';
import TopicNode, { TopicNodeData } from './topic-node';

interface TopicCanvasProps {
  issues: any[]; // 일단 any
}

// 리렌더링 방지를 위해 nodeTypes를 컴포넌트 외부에 선언
const nodeTypes = {
  topicNode: TopicNode,
};

function issuesFormatter(issues: any[]) {
  return [
    {
      id: 'n1',
      type: 'topicNode',
      position: { x: 0, y: 0 },
      data: { title: '홍보 플랫폼 선정', status: ISSUE_STATUS.VOTE },
    },
    {
      id: 'n2',
      type: 'topicNode',
      position: { x: 0, y: 100 },
      data: { title: '예산 확정', status: ISSUE_STATUS.SELECT },
    },
  ] as Node<TopicNodeData>[];
}

function edgesFormatter(issues: any[]) {
  return [{ id: 'n1-n2', source: 'n1', target: 'n2' }];
}

export default function TopicCanvas({ issues }: TopicCanvasProps) {
  const initialNodes = useMemo(() => issuesFormatter(issues), [issues]);
  const initialEdges = useMemo(() => edgesFormatter(issues), []);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}
