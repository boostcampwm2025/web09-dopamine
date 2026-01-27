import type { ReactNode } from 'react';
import { create } from 'zustand';

export type ModalType = 'close-issue' | 'invite' | 'default';

interface OpenModalPayload {
  title?: string;
  content: ReactNode;
  closeOnOverlayClick?: boolean;
  hasCloseButton?: boolean;
  onClose?: () => void;
  onSubmit?: () => void | Promise<void>;
  submitButtonText?: string;
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
  modalType: 'default',
  isPending: false,

  openModal: ({
    title,
    content,
    closeOnOverlayClick = true,
    hasCloseButton = true,
    onClose,
    onSubmit,
    submitButtonText = '완료',
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
      submitButtonText,
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
      modalType: 'default',
      isPending: false,
    });
  },

  setIsPending: (pending: boolean) => {
    set({ isPending: pending });
  },
}));
