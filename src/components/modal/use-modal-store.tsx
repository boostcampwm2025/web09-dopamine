import { create } from 'zustand';
import type { ReactNode } from 'react';

interface OpenModalPayload {
  title?: string;
  content: ReactNode;
  closeOnOverlayClick?: boolean;
  hasCloseButton?: boolean;
  onClose?: () => void;
}

interface ModalState {
  isOpen: boolean;
  title?: string;
  content: ReactNode | null;
  closeOnOverlayClick: boolean;
  hasCloseButton?: boolean;
  onClose?: () => void;
  openModal: (payload: OpenModalPayload) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  title: undefined,
  content: null,
  closeOnOverlayClick: true,
  hasCloseButton: true,
  onClose: undefined,

  openModal: ({ title, content, closeOnOverlayClick = true, hasCloseButton = true, onClose }) => {
    set({
      isOpen: true,
      title,
      content,
      closeOnOverlayClick,
      hasCloseButton,
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
      hasCloseButton: true,
      onClose: undefined,
    });
  },
}));
