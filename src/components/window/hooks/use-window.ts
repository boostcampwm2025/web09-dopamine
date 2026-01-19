'use client';

import { useEffect, useRef, useState } from 'react';

interface UseWindowOptions {
  initialPosition?: { x: number; y: number };
}

export function useWindow({ initialPosition }: UseWindowOptions) {
  const defaultPositionRef = useRef({ x: 120, y: 120 });
  const resolvedInitialPosition = initialPosition ?? defaultPositionRef.current;
  const [position, setPosition] = useState(resolvedInitialPosition);

  useEffect(() => {
    if (!initialPosition) return;

    setPosition(initialPosition);
  }, [initialPosition?.x, initialPosition?.y]);

  return {
    position,
  };
}
