import { useCallback, useMemo, useState } from 'react';
import { Node } from '@xyflow/react';
import { ISSUE_STATUS } from '@/constants/issue';
import { IssueConnection, IssueMapData, IssueNode } from '@/types/issue';
import { TopicNodeData } from '../_components/topic-node';
import { useTopicMutations } from './use-topic-mutations';
import { useTopicQuery } from './use-topic-query';

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
  return connections.map((conn) => {
    // TopicNode의 Handle ID 규칙에 맞게 변환 (ex. "left" → "left-source")
    const sourceHandleId = conn.sourceHandle ? `${conn.sourceHandle}-source` : undefined;
    const targetHandleId = conn.targetHandle ? `${conn.targetHandle}-target` : undefined;

    return {
      id: conn.id,
      source: conn.issueAId,
      target: conn.issueBId,
      sourceHandle: sourceHandleId,
      targetHandle: targetHandleId,
    };
  });
}

interface UseTopicCanvasProps {
  topicId: string;
  initialIssues: IssueMapData[];
  initialNodes: IssueNode[];
  initialConnections: IssueConnection[];
}

export function useTopicCanvas({
  topicId,
  initialIssues,
  initialNodes: initialNodesData,
  initialConnections,
}: UseTopicCanvasProps) {
  const { createConnection, deleteConnection, updateNodePosition } = useTopicMutations(topicId);

  // TanStack Query로 상태 관리
  const {
    issues,
    nodes: issueNodes,
    connections,
  } = useTopicQuery(topicId, initialIssues, initialNodesData, initialConnections);

  // ReactFlow 노드로 변환
  const reactFlowNodes = useMemo(
    () => nodesToReactFlowNodes(issues, issueNodes),
    [issues, issueNodes],
  );

  // ReactFlow 엣지로 변환
  const reactFlowEdges = useMemo(() => connectionsToReactFlowEdges(connections), [connections]);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // 노드 위치 변경 처리
  const onNodesChange = useCallback(
    (changes: any) => {
      changes.forEach((change: any) => {
        // 노드 드래그 완료 (position 변경)
        if (change.type === 'position' && change.dragging === false && change.position) {
          const nodeId = issueNodes.find((n) => n.issueId === change.id)?.id;
          if (nodeId) {
            updateNodePosition({
              nodeId,
              positionX: change.position.x,
              positionY: change.position.y,
            });
          }
        }
      });
    },
    [issueNodes, updateNodePosition],
  );

  // 엣지 삭제 처리
  const onEdgesChange = useCallback(
    (changes: any) => {
      changes.forEach((change: any) => {
        if (change.type === 'remove') {
          deleteConnection(change.id);
        }
      });
    },
    [deleteConnection],
  );

  // 연결 생성 처리
  const onConnect = useCallback(
    (params: any) => {
      // 중복 체크
      const isDuplicate = connections.some(
        (conn) =>
          (conn.issueAId === params.source && conn.issueBId === params.target) ||
          (conn.issueAId === params.target && conn.issueBId === params.source),
      );

      if (isDuplicate) {
        return;
      }

      // sourceHandle/targetHandle에서 "-source", "-target" 제거
      const sourceHandle = params.sourceHandle?.replace('-source', '') || null;
      const targetHandle = params.targetHandle?.replace('-target', '') || null;

      createConnection({
        issueAId: params.source,
        issueBId: params.target,
        sourceHandle,
        targetHandle,
      });
    },
    [connections, createConnection],
  );

  // 호버된 노드와 연결된 모든 노드 ID 계산 (BFS)
  const connectedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();

    // 인접 리스트 구축
    const adjacencyList = new Map<string, Set<string>>();
    reactFlowEdges.forEach((edge) => {
      if (!adjacencyList.has(edge.source)) {
        adjacencyList.set(edge.source, new Set());
      }
      if (!adjacencyList.has(edge.target)) {
        adjacencyList.set(edge.target, new Set());
      }
      adjacencyList.get(edge.source)!.add(edge.target);
      adjacencyList.get(edge.target)!.add(edge.source);
    });

    // BFS로 연결된 모든 노드 찾기
    const visited = new Set<string>([hoveredNodeId]);
    const queue = [hoveredNodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = adjacencyList.get(current);

      if (neighbors) {
        neighbors.forEach((neighbor) => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }
    }

    return visited;
  }, [hoveredNodeId, reactFlowEdges]);

  // 노드에 dimmed 상태 추가
  const nodesWithDimmed = useMemo(() => {
    if (!hoveredNodeId) return reactFlowNodes;

    return reactFlowNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        dimmed: !connectedNodeIds.has(node.id), // 이어져있지 않은 노드는 dimmed 처리
      },
    }));
  }, [reactFlowNodes, hoveredNodeId, connectedNodeIds]);

  const onNodeMouseEnter = useCallback(
    (_event: any, node: Node) => {
      if (!isConnecting) {
        setHoveredNodeId(node.id);
      }
    },
    [isConnecting],
  );

  const onNodeMouseLeave = useCallback(() => {
    if (!isConnecting) {
      setHoveredNodeId(null);
    }
  }, [isConnecting]);

  const onConnectStart = useCallback(() => {
    setIsConnecting(true);
    setHoveredNodeId(null); // 연결 시작하면 hover 효과 제거
  }, []);

  const onConnectEnd = useCallback(() => {
    setIsConnecting(false);
  }, []);

  // useCallback으로 감싸서 과도한 렌더링 방지
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      deleteConnection(edgeId);
    },
    [deleteConnection],
  );

  return {
    nodes: nodesWithDimmed,
    edges: reactFlowEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onConnectStart,
    onConnectEnd,
    deleteEdge: handleDeleteEdge,
  };
}
