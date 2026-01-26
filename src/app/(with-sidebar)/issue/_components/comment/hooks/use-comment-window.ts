'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTooltipStore } from '@/components/tooltip/use-tooltip-store';
import type { useCommentMutations } from '@/hooks/comment';
import type { useCommentQuery } from '@/hooks/comment';

interface UseCommentWindowOptions {
  issueId: string;
  ideaId: string;
  userId: string;
  createMutation: ReturnType<typeof useCommentMutations>['createMutation'];
}

interface GetCommentErrorMessageOptions {
  issueId: string;
  ideaId: string;
  commentsQuery: ReturnType<typeof useCommentQuery>['commentsQuery'];
  createMutation: ReturnType<typeof useCommentMutations>['createMutation'];
  updateMutation: ReturnType<typeof useCommentMutations>['updateMutation'];
  deleteMutation: ReturnType<typeof useCommentMutations>['deleteMutation'];
}

export function getCommentErrorMessage({
  issueId,
  ideaId,
  commentsQuery,
  createMutation,
  updateMutation,
  deleteMutation,
}: GetCommentErrorMessageOptions) {
  const missingContextMessage =
    !issueId || !ideaId ? '아이디어 정보가 없어 댓글을 불러오지 못했습니다.' : null;
  const queryErrorMessage = commentsQuery.error
    ? commentsQuery.error instanceof Error
      ? commentsQuery.error.message
      : '댓글을 불러오지 못했습니다.'
    : null;
  const mutationErrorMessage = createMutation.error
    ? createMutation.error instanceof Error
      ? createMutation.error.message
      : '댓글 등록에 실패했습니다.'
    : updateMutation.error
      ? updateMutation.error instanceof Error
        ? updateMutation.error.message
        : '댓글 수정에 실패했습니다.'
      : deleteMutation.error
        ? deleteMutation.error instanceof Error
          ? deleteMutation.error.message
          : '댓글 삭제에 실패했습니다.'
        : null;

  return missingContextMessage ?? queryErrorMessage ?? mutationErrorMessage;
}

export function useCommentWindow({
  issueId,
  ideaId,
  userId,
  createMutation,
}: UseCommentWindowOptions) {

  const [inputValue, setInputValue] = useState('');
  const openTooltip = useTooltipStore((state) => state.openTooltip);
  const closeTooltip = useTooltipStore((state) => state.closeTooltip);

  /**
   * [생성 로직] 새로운 댓글을 등록합니다. 중복 제출을 방지하고 성공 시 목록을 갱신합니다.
   */
  const handleSubmit = useCallback(
    async (target?: HTMLElement) => {
      const trimmed = inputValue.trim();
      const isSubmitting = createMutation.isPending;
      // 유효성 검사: 내용이 없거나 이미 제출 중인 경우 중단
      if (!trimmed || !issueId || !ideaId || !userId || isSubmitting) {
        if (!trimmed && target) {
          openTooltip(target, '댓글 내용을 입력해주세요.');
          const timer = setTimeout(() => {
            closeTooltip();
          }, 1000);

          return () => clearTimeout(timer);
        }
        return;
      }

      try {
        await createMutation.mutateAsync({ userId, content: trimmed });
        setInputValue('');
      } catch {
        // tanstack error state에 의해 에러 처리
      }
    },
    [createMutation, ideaId, inputValue, issueId, openTooltip, userId, closeTooltip],
  );

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      // 한글 입력 중이면 제출하지 않음
      if (event.nativeEvent.isComposing) {
        return;
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit(event.currentTarget);
      }
    },
    [handleSubmit],
  );

  return {
    inputValue,
    setInputValue,
    handleSubmit,
    handleInputKeyDown,
  };
}
