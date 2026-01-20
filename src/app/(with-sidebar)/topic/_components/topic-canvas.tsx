'use client';

import { useCallback, useMemo, useState } from 'react';
import { Node, ReactFlow, addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ISSUE_STATUS } from '@/constants/issue';
import { EDGE_STYLE } from '@/constants/topic';
import { IssueConnection, IssueMapData, IssueNode } from '@/types/issue';
import topicEdge from './topic-edge';
import TopicNode, { TopicNodeData } from './topic-node';

interface TopicCanvasProps {
  issues: IssueMapData[];
  nodes: IssueNode[];
  connections: IssueConnection[];
}

// 리렌더링 방지를 위해 nodeTypes를 컴포넌트 외부에 선언
const nodeTypes = {
  topicNode: TopicNode,
};

function nodesToReactFlowNodes(issues: IssueMapData[], nodes: IssueNode[]) {
  return nodes.map((node) => {
    const issue = issues.find((i) => i.id === node.issueId);
    return {
      id: node.issueId,
      type: 'topicNode',
      position: { x: node.positionX, y: node.positionY },
      data: {
        title: issue?.title || 'Unknown',
        status: issue?.status || ISSUE_STATUS.BRAINSTORMING,
      },
    } as Node<TopicNodeData>;
  });
}

function connectionsToReactFlowEdges(connections: IssueConnection[]) {
  return connections.map((conn) => ({
    id: conn.id,
    source: conn.issueAId,
    target: conn.issueBId,
    sourceHandle: conn.sourceHandle,
    targetHandle: conn.targetHandle,
  }));
}

export default function TopicCanvas({ issues, nodes: issueNodes, connections }: TopicCanvasProps) {
  const initialNodes = useMemo(() => nodesToReactFlowNodes(issues, issueNodes), [issues, issueNodes]);
  const initialEdges = useMemo(() => connectionsToReactFlowEdges(connections), [connections]);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot: any) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot: any) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect = useCallback(
    (params: any) =>
      setEdges((edgesSnapshot: any) => {
        // 이미 같은 연결이 존재하는지 확인 (양방향 모두 체크)
        const isDuplicate = edgesSnapshot.some(
          (edge: any) =>
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
          minZoom: 0.5,
          maxZoom: 1,
        }}
        fitView
      />
    </div>
  );
}
