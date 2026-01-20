'use client';

import { useCallback, useMemo, useState } from 'react';
import { Node, ReactFlow, addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ISSUE_STATUS } from '@/constants/issue';
import { EDGE_STYLE } from '@/constants/topic';
import topicEdge from './topic-edge';
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
      position: { x: 100, y: 100 },
      data: { title: '홍보 플랫폼 선정', status: ISSUE_STATUS.VOTE },
    },
    {
      id: 'n2',
      type: 'topicNode',
      position: { x: 400, y: 200 },
      data: { title: '예산 확정', status: ISSUE_STATUS.SELECT },
    },
    {
      id: 'n3',
      type: 'topicNode',
      position: { x: 250, y: 350 },
      data: { title: '마케팅 전략', status: ISSUE_STATUS.BRAINSTORMING },
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
    (params: any) =>
      setEdges((edgesSnapshot) => {
        // 이미 같은 연결이 존재하는지 확인 (양방향 모두 체크)
        const isDuplicate = edgesSnapshot.some(
          (edge) =>
            (edge.source === params.source && edge.target === params.target) ||
            (edge.source === params.target && edge.target === params.source),
        );

        // 중복이면 추가하지 않음
        if (isDuplicate) {
          return edgesSnapshot;
        }

        return addEdge(params, edgesSnapshot);
      }),
    [],
  );

  const defaultEdgeOptions = {
    style: EDGE_STYLE,
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionLineComponent={topicEdge}
        onConnect={onConnect}
        defaultEdgeOptions={defaultEdgeOptions}
        fitViewOptions={{
          minZoom: 0.5, // 최소 줌
          maxZoom: 1, // 최대 줌
        }}
        fitView
      />
    </div>
  );
}
