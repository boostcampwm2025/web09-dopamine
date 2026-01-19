import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEventHandler } from 'react';
import { useTooltipStore } from '@/components/tooltip/use-tooltip-store';
import { ISSUE_STATUS, VOTE_TYPE } from '@/constants/issue';
import type { IssueStatus } from '@/types/issue';
import { useVoteMutation } from '../../hooks/react-query/use-vote-mutation';
import type { FilterType } from '../../hooks/use-filter-idea';
import { CardStatus } from '../../types/idea';

interface UseIdeaCardProps {
  id?: string;
  userId: string;
  content?: string;
  isSelected?: boolean;
  status?: CardStatus;
  editable?: boolean;
  onSave?: (content: string) => void;
  categoryId?: string | null;
  inCategory: boolean;
  issueStatus?: IssueStatus;
  bringToFront: (id: string) => void;
  getListeners?: () => { onPointerDown?: PointerEventHandler } | undefined;
  onDelete?: () => void;
  onClick?: () => void;
  selectIdea: (id: string) => void;
}

export default function useIdeaCard(props: UseIdeaCardProps) {
  const {
    id = '',
    userId = '',
    content = '',
    isSelected = false,
    status: statusOverride = 'default',
    editable = false,
    onSave,
    categoryId,
    inCategory,
    issueStatus,
    bringToFront,
    getListeners,
    onDelete,
    onClick,
    selectIdea,
  } = props;

  const openTooltip = useTooltipStore((state) => state.openTooltip);
  const closeTooltip = useTooltipStore((state) => state.closeTooltip);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [status, setStatus] = useState<CardStatus>('default');

  const { mutate } = useVoteMutation(id);

  // 편집 관련 로컬 상태
  // isEditing: 현재 편집 모드인지
  // editValue: 편집 중인 텍스트
  // displayContent: 화면에 보여줄 최종 내용
  const [isEditing, setIsEditing] = useState<boolean>(!!editable);
  const [editValue, setEditValue] = useState<string>(content);
  const [displayContent, setDisplayContent] = useState<string>(content);

  // 부모로부터 content가 바뀌면 로컬 editValue와 displayContent를 동기화합니다.
  useEffect(() => {
    setEditValue(content);
    setDisplayContent(content);
  }, [content]);

  // 상태 우선순위: isSelected(선택된 카드) 가 최우선으로 'selected'를 적용합니다.
  // 그 외에는 부모에서 전달된 `status`(예: 'highlighted')를 그대로 사용합니다.
  useEffect(() => {
    if (isSelected) {
      setStatus('selected');
      return;
    }
    setStatus(statusOverride);
  }, [isSelected, statusOverride]);

  const handleAgree = () => {
    mutate({ userId, voteType: VOTE_TYPE.AGREE });
  };

  const handleDisagree = () => {
    mutate({ userId, voteType: VOTE_TYPE.DISAGREE });
  };

  // 편집 내용을 제출합니다. 비어있으면 무시.
  // onSave 콜백이 제공되면 변경된 값을 전달해 외부 동기화를 할 수 있습니다.
  const submitEdit = useCallback(() => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      textareaRef.current?.focus();
      openTooltip(textareaRef.current!, '내용을 입력해주세요');
      const timer = setTimeout(() => {
        closeTooltip();
      }, 1000);

      return () => clearTimeout(timer);
    }
    setDisplayContent(trimmed);
    setIsEditing(false);
    if (onSave) onSave(trimmed);
  }, [editValue, onSave]);

  const handleKeyDownEdit = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitEdit();
      }
    },
    [submitEdit],
  );

  const handlePointerDown: PointerEventHandler = (e) => {
    if (id && !inCategory) {
      bringToFront(id);
    }

    if (isEditing) {
      textareaRef.current?.focus();
    }

    const listeners = getListeners?.();
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

  return {
    textareaRef,
    status,
    isEditing,
    editValue,
    displayContent,
    setEditValue,
    handleAgree,
    handleDisagree,
    submitEdit,
    handleKeyDownEdit,
    handlePointerDown,
    handleDeleteClick,
    handleCardClick,
  };
}

export const useIdeaStatus = (filteredIds: Set<string>, activeFilter: FilterType) => {
  return useCallback(
    (ideaId: string): CardStatus => {
      if (!filteredIds.has(ideaId)) return 'default';
      if (activeFilter === 'most-liked') return 'mostLiked';
      if (activeFilter === 'need-discussion') return 'needDiscussion';
      return 'default';
    },
    [filteredIds, activeFilter],
  );
};
