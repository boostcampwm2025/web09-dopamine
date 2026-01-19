import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIdeasQuery } from '@/app/(with-sidebar)/issue/hooks/react-query/use-ideas-query';
import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';

const TEMP_IDEA_STORAGE_KEY = (issueId: string) => `temp-idea-${issueId}`;

export function useIdeasWithTemp(issueId: string) {
  // 서버에서 아이디어 조회 (TanStack Query)
  const { data: serverIdeas = [], isLoading, isError } = useIdeasQuery(issueId);

  // 임시 아이디어 1개 관리 (React state + localStorage)
  const [tempIdea, setTempIdea] = useState<IdeaWithPosition | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(TEMP_IDEA_STORAGE_KEY(issueId));
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // localStorage 동기화
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (tempIdea) {
      localStorage.setItem(TEMP_IDEA_STORAGE_KEY(issueId), JSON.stringify(tempIdea));
    } else {
      localStorage.removeItem(TEMP_IDEA_STORAGE_KEY(issueId));
    }
  }, [tempIdea, issueId]);

  // 서버 아이디어 + 임시 아이디어 통합
  const ideas: IdeaWithPosition[] = useMemo(() => {
    return tempIdea ? [...serverIdeas, tempIdea] : serverIdeas;
  }, [serverIdeas, tempIdea]);

  // 편집 중인 아이디어가 있는지 체크
  const hasEditingIdea = useMemo(() => {
    return tempIdea?.editable ?? false;
  }, [tempIdea]);

  // temp 아이디어 추가
  const addTempIdea = useCallback((idea: IdeaWithPosition) => {
    setTempIdea(idea);
  }, []);

  // temp 아이디어 삭제
  const deleteTempIdea = useCallback(() => {
    setTempIdea(null);
  }, []);

  // temp 아이디어 내용 수정
  const updateTempIdeaContent = useCallback((content: string) => {
    setTempIdea((prev) => (prev ? { ...prev, content, editable: false } : null));
  }, []);

  // temp 아이디어 위치 수정
  const updateTempIdeaPosition = useCallback((position: { x: number; y: number } | null) => {
    setTempIdea((prev) => (prev ? { ...prev, position } : null));
  }, []);

  // temp 아이디어 편집 상태 수정
  const updateTempIdeaEditable = useCallback((editable: boolean) => {
    setTempIdea((prev) => (prev ? { ...prev, editable } : null));
  }, []);

  return {
    ideas,
    serverIdeas,
    tempIdea,
    hasEditingIdea,
    isLoading,
    isError,
    addTempIdea,
    deleteTempIdea,
    updateTempIdeaContent,
    updateTempIdeaPosition,
    updateTempIdeaEditable,
  };
}
