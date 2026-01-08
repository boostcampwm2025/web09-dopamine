import { create } from 'zustand';

interface CanvasState {
  scale: number;
  offset: { x: number; y: number };
  setScale: (scale: number) => void;
  setOffset: (offset: { x: number; y: number }) => void;
  reset: () => void;
}

const DEFAULT_SCALE = 0.7;
const DEFAULT_OFFSET = { x: 0, y: 0 };

export const useCanvasStore = create<CanvasState>((set) => ({
  scale: DEFAULT_SCALE,
  offset: DEFAULT_OFFSET,
  setScale: (scale) => set({ scale }),
  setOffset: (offset) => set({ offset }),
  reset: () => set({ scale: DEFAULT_SCALE, offset: DEFAULT_OFFSET }),
}));
