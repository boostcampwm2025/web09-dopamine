'use client';

import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { motion, useAnimationFrame } from 'framer-motion';

const SHAPE_SIZE = 80;
const SHAPE_RADIUS = 24;

const ShapesContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
`;

const Shape = styled(motion.div)<{ color: string }>`
  position: absolute;
  width: ${SHAPE_SIZE}px;
  height: ${SHAPE_SIZE}px;
  border-radius: ${SHAPE_RADIUS}px;
  background: ${({ color }) => color};
  transition: background 0.3s ease;
`;

const COLORS = {
  default: 'rgba(200, 200, 200, 0.2)',
  blue: 'rgba(59, 130, 246, 0.2)',
  green: 'rgba(0, 169, 79, 0.2)',
};

const BLUE_ZONE = { maxX: 0.35, minY: 0.45 };
const GREEN_ZONE = { minX: 0.6, maxY: 0.65 };

interface Viewport {
  width: number;
  height: number;
}

function getColorByPosition(x: number, y: number, viewport: Viewport): string {
  const relativeX = x / viewport.width;
  const relativeY = y / viewport.height;

  if (relativeX < BLUE_ZONE.maxX && relativeY > BLUE_ZONE.minY) {
    return COLORS.blue;
  }

  if (relativeX > GREEN_ZONE.minX && relativeY < GREEN_ZONE.maxY) {
    return COLORS.green;
  }

  return COLORS.default;
}

interface ShapeData {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function FloatingShapes() {
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const shapesRef = useRef<ShapeData[]>([]);
  const viewportRef = useRef<Viewport>({ width: 0, height: 0 });

  useEffect(() => {
    const updateViewport = () => {
      viewportRef.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    };

    updateViewport();

    const initialShapes: ShapeData[] = [
      {
        id: 1,
        x: viewportRef.current.width * 0.3,
        y: viewportRef.current.height * 0.4,
        vx: 1.5,
        vy: 1.2,
      },
      {
        id: 2,
        x: viewportRef.current.width * 0.6,
        y: viewportRef.current.height * 0.6,
        vx: -1.3,
        vy: -1.4,
      },
    ];

    shapesRef.current = initialShapes;
    setShapes(initialShapes);

    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useAnimationFrame(() => {
    const { width, height } = viewportRef.current;
    if (width === 0 || height === 0) return;

    shapesRef.current = shapesRef.current.map((shape) => {
      let { x, y, vx, vy } = shape;

      x += vx;
      y += vy;

      // 벽에 부딪히면 반사
      if (x <= 0 || x >= width - SHAPE_SIZE) {
        vx = -vx;
        x = Math.max(0, Math.min(x, width - SHAPE_SIZE));
      }
      if (y <= 0 || y >= height - SHAPE_SIZE) {
        vy = -vy;
        y = Math.max(0, Math.min(y, height - SHAPE_SIZE));
      }

      return { ...shape, x, y, vx, vy };
    });

    setShapes([...shapesRef.current]);
  });

  return (
    <ShapesContainer>
      {shapes.map((shape) => (
        <Shape
          key={shape.id}
          color={getColorByPosition(
            shape.x + SHAPE_SIZE / 2,
            shape.y + SHAPE_SIZE / 2,
            viewportRef.current,
          )}
          style={{
            left: shape.x,
            top: shape.y,
          }}
        />
      ))}
    </ShapesContainer>
  );
}
