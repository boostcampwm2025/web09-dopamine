import { create } from 'zustand';

interface TooltipState {
  isOpen: boolean;
  text: string;
  targetNode: HTMLElement | null;

  openTooltip: (target: HTMLElement, text: string) => void;
  closeTooltip: () => void;
}

export const useTooltipStore = create<TooltipState>((set) => ({
  isOpen: false,
  text: '',
  targetNode: null,

  openTooltip: (target, text) => {
    set({ isOpen: true, targetNode: target, text });
  },

  closeTooltip: () => {
    set({ isOpen: false, targetNode: null });
  },
}));
