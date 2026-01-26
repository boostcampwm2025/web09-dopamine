import type { ReactNode } from 'react';
import { create } from 'zustand';

export type ModalType = 'close-issue' | 'default';

interface OpenModalPayload {
  title?: string;
  content: ReactNode;
  closeOnOverlayClick?: boolean;
  hasCloseButton?: boolean;
  onClose?: () => void;
  onSubmit?: () => void | Promise<void>;
  modalType?: ModalType;
}

interface ModalState {
  isOpen: boolean;
  title?: string;
  content: ReactNode | null;
  closeOnOverlayClick: boolean;
  hasCloseButton?: boolean;
  onClose?: () => void;
  onSubmit?: () => void | Promise<void>;
  submitButtonText?: string;
  hasFooter: boolean;
  modalType: ModalType;
  openModal: (payload: OpenModalPayload) => void;
  closeModal: () => void;
  isPending: boolean;
  setIsPending: (pending: boolean) => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  title: undefined,
  content: null,
  closeOnOverlayClick: true,
  hasCloseButton: true,
  onClose: undefined,
  onSubmit: undefined,
  hasFooter: true,
  modalType: 'default',
  isPending: false,

  openModal: ({
    title,
    content,
    closeOnOverlayClick = true,
    hasCloseButton = true,
    onClose,
    onSubmit,
    modalType = 'default',
  }) => {
    set({
      isOpen: true,
      title,
      content,
      closeOnOverlayClick,
      hasCloseButton,
      onClose,
      onSubmit,
      modalType,
      isPending: false,
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
      onSubmit: undefined,
      submitButtonText: '만들기',
      hasFooter: true,
      modalType: 'default',
      isPending: false,
    });
  },

  setIsPending: (pending: boolean) => {
    set({ isPending: pending });
  },
}));
