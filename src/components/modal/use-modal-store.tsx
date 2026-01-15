import type { ReactNode } from 'react';
import { create } from 'zustand';

export type ModalType = 'close-issue' | 'default';

interface OpenModalPayload {
  title?: string;
  content: ReactNode;
  closeOnOverlayClick?: boolean;
  hasCloseButton?: boolean;
  onClose?: () => void;
  modalType?: ModalType;
}

interface ModalState {
  isOpen: boolean;
  title?: string;
  content: ReactNode | null;
  closeOnOverlayClick: boolean;
  hasCloseButton?: boolean;
  onClose?: () => void;
  modalType: ModalType;
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
  modalType: 'default',

  openModal: ({
    title,
    content,
    closeOnOverlayClick = true,
    hasCloseButton = true,
    onClose,
    modalType = 'default',
  }) => {
    set({
      isOpen: true,
      title,
      content,
      closeOnOverlayClick,
      hasCloseButton,
      onClose,
      modalType,
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
      modalType: 'default',
    });
  },
}));
