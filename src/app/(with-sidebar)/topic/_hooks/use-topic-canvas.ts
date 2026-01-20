import { useCallback, useMemo, useState } from 'react';
import { Node, addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import { ISSUE_STATUS } from '@/constants/issue';
import { IssueConnection, IssueMapData, IssueNode } from '@/types/issue';
import { TopicNodeData } from '../_components/topic-node';

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
  issues: IssueMapData[];
  nodes: IssueNode[];
  connections: IssueConnection[];
}

export function useTopicCanvas({ issues, nodes: issueNodes, connections }: UseTopicCanvasProps) {
  // 초기 노드 생성
  const initialNodes = useMemo(
    () => nodesToReactFlowNodes(issues, issueNodes),
    [issues, issueNodes],
  );

  // 초기 엣지(연결선) 생성
  const initialEdges = useMemo(() => connectionsToReactFlowEdges(connections), [connections]);

  const [nodes, setNodes] = useState(initialNodes); // React Flow 노드 상태
  const [edges, setEdges] = useState(initialEdges); // React Flow 엣지 상태
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false); // 연결중인지 파악

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot: any) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot: any) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  // 중복 연결 방지된 onConnect 함수
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

  // 호버된 노드와 연결된 모든 노드 ID 계산 (BFS)
  const connectedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();

    // 인접 리스트 구축
    const adjacencyList = new Map<string, Set<string>>();
    edges.forEach((edge) => {
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
  }, [hoveredNodeId, edges]);

  // 노드에 dimmed 상태 추가
  const nodesWithDimmed = useMemo(() => {
    if (!hoveredNodeId) return nodes;

    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        dimmed: !connectedNodeIds.has(node.id), // 이어져있지 않은 노드는 dimmed 처리
      },
    }));
  }, [nodes, hoveredNodeId, connectedNodeIds]);

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

  return {
    nodes: nodesWithDimmed,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onConnectStart,
    onConnectEnd,
  };
}
