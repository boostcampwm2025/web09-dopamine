import { create } from 'zustand';
import type { ReactNode } from 'react';

interface OpenModalPayload {
  title?: string;
  content: ReactNode;
  closeOnOverlayClick?: boolean;
  onClose?: () => void;
}

interface ModalState {
  isOpen: boolean;
  title?: string;
  content: ReactNode | null;
  closeOnOverlayClick: boolean;
  onClose?: () => void;
  openModal: (payload: OpenModalPayload) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  title: undefined,
  content: null,
  closeOnOverlayClick: true,
  onClose: undefined,

  openModal: ({ title, content, closeOnOverlayClick = true, onClose }) => {
    set({
      isOpen: true,
      title,
      content,
      closeOnOverlayClick,
      onClose,
    });
  },

  closeModal: () => {
    const { onClose } = get();
    if (onClose) onClose();
    set({
      isOpen: false,
      title: undefined,
      content: null,
      closeOnOverlayClick: true,
      onClose: undefined,
    });
  },
}));
