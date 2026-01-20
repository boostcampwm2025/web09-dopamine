import { Node } from '@xyflow/react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  SimulationNodeDatum,
} from 'd3-force';

interface ForceNode extends SimulationNodeDatum {
  id: string;
  x: number;
  y: number;
}

interface ForceLink {
  source: string;
  target: string;
}

interface ForceLayoutOptions {
  nodes: Node[];
  edges: { source: string; target: string }[];
  onTick: (nodes: Node[]) => void;
  centerX?: number;
  centerY?: number;
  linkDistance?: number;
  linkStrength?: number;
  chargeStrength?: number;
  collideRadius?: number;
  alphaDecay?: number;
}

export function createForceLayout({
  nodes,
  edges,
  onTick,
  centerX = 400,
  centerY = 300,
  linkDistance = 150,
  linkStrength = 0.5,
  chargeStrength = -800,
  collideRadius = 80,
  alphaDecay = 0.02,
}: ForceLayoutOptions) {
  // 시뮬레이션 노드 생성
  const simulationNodes: ForceNode[] = nodes.map((node) => ({
    id: node.id,
    x: node.position.x,
    y: node.position.y,
  }));

  // 시뮬레이션 링크 생성
  const simulationLinks: ForceLink[] = edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
  }));

  // d3-force 시뮬레이션 생성
  const simulation = forceSimulation(simulationNodes)
    .force(
      'link',
      forceLink(simulationLinks)
        .id((d: any) => d.id)
        .distance(linkDistance)
        .strength(linkStrength),
    )
    .force('charge', forceManyBody().strength(chargeStrength))
    .force('center', forceCenter(centerX, centerY))
    .force('collide', forceCollide().radius(collideRadius))
    .alphaDecay(alphaDecay)
    .on('tick', () => {
      // 계산된 위치를 노드에 적용
      const updatedNodes = nodes.map((node) => {
        const simulationNode = simulationNodes.find((n) => n.id === node.id);
        if (!simulationNode) return node;

        return {
          ...node,
          position: {
            x: simulationNode.x ?? node.position.x,
            y: simulationNode.y ?? node.position.y,
          },
        };
      });

      onTick(updatedNodes);
    });

  return simulation;
}

export function generateRandomPosition(
  centerX = 400,
  centerY = 300,
  spread = 100,
): { x: number; y: number } {
  return {
    x: centerX + (Math.random() - 0.5) * spread,
    y: centerY + (Math.random() - 0.5) * spread,
  };
}
