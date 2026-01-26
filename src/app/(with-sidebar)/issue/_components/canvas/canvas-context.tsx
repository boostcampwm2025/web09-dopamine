'use client';

import { RefObject, createContext, useContext } from 'react';

interface CanvasContextValue {
  scale: number;
  viewportRef: RefObject<HTMLDivElement | null> | null;
}

export const CanvasContext = createContext<CanvasContextValue>({ scale: 1, viewportRef: null });

export const useCanvasContext = () => useContext(CanvasContext);
