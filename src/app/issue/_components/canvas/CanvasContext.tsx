'use client';

import { createContext, useContext } from 'react';

interface CanvasContextValue {
  scale: number;
}

export const CanvasContext = createContext<CanvasContextValue>({ scale: 1 });

export const useCanvasContext = () => useContext(CanvasContext);
