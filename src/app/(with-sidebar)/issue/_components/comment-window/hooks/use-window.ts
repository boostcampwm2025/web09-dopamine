'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { createComment, fetchComments, type Comment } from '@/lib/api/comment';

interface UseWindowOptions {
  initialPosition?: { x: number; y: number };
  ideaId: string;
  userId: string;
}

export function useWindow({ initialPosition, ideaId, userId }: UseWindowOptions) {
  const defaultPositionRef = useRef({ x: 120, y: 120 });
  const resolvedInitialPosition = initialPosition ?? defaultPositionRef.current;
  
  const [position, setPosition] = useState(resolvedInitialPosition);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  // 외부에서 전달된 초기 위치 값이 변경될 때 상태 동기화
  useEffect(() => {
    if (!initialPosition) return;
    setPosition(initialPosition);
  }, [initialPosition?.x, initialPosition?.y]);

  /**
   * [조회 로직] 아이디어 ID가 바뀔 때마다 해당 아이디어의 댓글 목록을 서버에서 가져옵니다.
   */
  useEffect(() => {
    if (!ideaId) {
      setComments([]);
      setErrorMessage('아이디어 정보가 없어 댓글을 불러올 수 없습니다.');
      return;
    }

    let isActive = true; // 언마운트 시점의 메모리 누수 및 상태 업데이트 방지용 플래그
    setIsLoading(true);
    setErrorMessage(null);

    fetchComments(ideaId)
      .then((data) => {
        if (!isActive) return;
        setComments(data);
      })
      .catch((error) => {
        if (!isActive) return;
        setErrorMessage(error instanceof Error ? error.message : '댓글을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [ideaId]);

  /**
   * [생성 로직] 새로운 댓글을 등록합니다. 중복 제출을 방지하고 성공 시 목록을 갱신합니다.
   */
  const handleSubmit = useCallback(async () => {
    const trimmed = inputValue.trim();
    // 유효성 검사: 내용이 없거나 이미 제출 중인 경우 중단
    if (!trimmed || !ideaId || !userId || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await createComment(ideaId, { userId, content: trimmed });
      // 낙관적 업데이트 대신 실제 생성된 데이터를 리스트에 추가
      setComments((prev) => [...prev, created]);
      setInputValue('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '댓글을 등록하지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [ideaId, inputValue, isSubmitting, userId]);

  /**
   * [입력 핸들링] 인풋창에서 Enter 키를 눌렀을 때 제출 함수를 실행합니다.
   */
  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return {
    position,
    comments,
    isLoading,
    isSubmitting,
    errorMessage,
    inputValue,
    setInputValue,
    handleSubmit,
    handleInputKeyDown,
  };
}
