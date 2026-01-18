'use client';

import type { PointerEventHandler, RefObject } from 'react';
import { ISSUE_STATUS } from '@/constants/issue';
import type { IssueStatus } from '@/types/issue';

interface UseIdeaCardHandlersParams {
  id: string;
  categoryId?: string | null;
  inCategory: boolean;
  isEditing: boolean;
  issueStatus?: IssueStatus;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  bringToFront: (id: string) => void;
  listeners?: { onPointerDown?: PointerEventHandler };
  onDelete?: () => void;
  onClick?: () => void;
  selectIdea: (id: string) => void;
}

export default function useIdeaCardHandlers({
  id,
  categoryId,
  inCategory,
  isEditing,
  issueStatus,
  textareaRef,
  bringToFront,
  listeners,
  onDelete,
  onClick,
  selectIdea,
}: UseIdeaCardHandlersParams) {
  const handlePointerDown: PointerEventHandler = (e) => {
    // z-index 업데이트는 드래그 시작 전에 처리
    if (id && !inCategory) {
      bringToFront(id);
    }

    if (isEditing) {
      textareaRef.current?.focus();
    }

    // listeners의 onPointerDown도 호출 (드래그를 위해)
    if (listeners?.onPointerDown) {
      listeners.onPointerDown(e);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const handleCardClick = () => {
    if (!id || !categoryId || isEditing || issueStatus !== ISSUE_STATUS.SELECT) {
      return;
    }
    if (onClick) {
      onClick();
      return;
    }
    selectIdea(id);
  };

  return { handlePointerDown, handleDeleteClick, handleCardClick };
}
