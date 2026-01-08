'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useModalStore } from './use-modal-store';
import * as S from './modal.styles';

export default function Modal() {
  const { isOpen, title, content, closeOnOverlayClick, hasCloseButton, closeModal } = useModalStore();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeModal]);

  if (!isOpen || !content) return null;

  return createPortal(
    <S.Overlay onClick={closeOnOverlayClick ? closeModal : undefined}>
      <S.Dialog
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {title ? (
          <S.Header>
            <span>{title}</span>
            {hasCloseButton ? 
            <S.CloseButton
              type="button"
              aria-label="닫기"
              onClick={closeModal}
            >
              &times;
            </S.CloseButton>
            : null}
          </S.Header>
        ) : null}
        <S.Body>{content}</S.Body>
      </S.Dialog>
    </S.Overlay>,
    document.body,
  );
}
