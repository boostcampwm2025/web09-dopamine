'use client';

import { useCallback, useEffect, useRef } from 'react';
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
    submitButtonText,
    setIsPending,
  } = useModalStore();

  // 최신 onSubmit을 항상 참조하기 위해 ref 사용
  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  const handleSubmit = useCallback(async () => {
    if (!onSubmitRef.current) return;

    try {
      setIsPending(true);
      await onSubmitRef.current();
    } catch (error) {
      console.error('Modal submit error:', error);
    } finally {
      setIsPending(false);
    }
  }, [setIsPending]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // 종료 모달의 경우 CloseIssueModal에서 처리
        if (modalType !== 'close-issue') {
          closeModal();
        }
      } else if (event.key === 'Enter' && !event.shiftKey && onSubmit && !isPending) {
        if (modalType !== 'invite') {
          event.preventDefault();
          handleSubmit();
        }
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
          {(onSubmit || submitButtonText) && (
            <S.SubmitButton
              type="button"
              onClick={handleSubmit}
              disabled={!onSubmit || isPending}
            >
              {isPending ? '처리 중...' : submitButtonText || '완료'}
            </S.SubmitButton>
          )}
        </S.Footer>
      </S.Dialog>
    </S.Overlay>,
    document.body,
  );
}
