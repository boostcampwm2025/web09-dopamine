'use client';

import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as S from './modal.styles';
import { useModalStore } from './use-modal-store';

export default function Modal() {
  const {
    isOpen,
    title,
    content,
    closeOnOverlayClick,
    hasCloseButton,
    modalType,
    closeModal,
    isPending,
    onSubmit,
    setIsPending,
  } = useModalStore();

  const handleSubmit = useCallback(async () => {
    if (!onSubmit) return;

    try {
      setIsPending(true);
      await onSubmit();
    } catch (error) {
      console.error('Modal submit error:', error);
    } finally {
      setIsPending(false);
    }
  }, [onSubmit, setIsPending]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // 종료 모달의 경우 CloseIssueModal에서 처리
        if (modalType !== 'close-issue') {
          closeModal();
        }
      } else if (event.key === 'Enter' && !event.shiftKey && onSubmit && !isPending) {
        event.preventDefault();
        handleSubmit();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeModal, modalType, onSubmit, isPending, handleSubmit]);

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
            {hasCloseButton ? (
              <S.CloseButton
                type="button"
                aria-label="닫기"
                onClick={closeModal}
              >
                &times;
              </S.CloseButton>
            ) : null}
          </S.Header>
        ) : null}
        <S.Body>{content}</S.Body>
        <S.Footer>
          {hasCloseButton && (
            <S.CancelButton
              type="button"
              onClick={() => closeModal()}
              disabled={isPending}
            >
              취소
            </S.CancelButton>
          )}
          {onSubmit && (
            <S.SubmitButton
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? '처리 중...' : '완료'}
            </S.SubmitButton>
          )}
        </S.Footer>
      </S.Dialog>
    </S.Overlay>,
    document.body,
  );
}
