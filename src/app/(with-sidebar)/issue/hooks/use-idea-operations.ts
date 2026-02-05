import { useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useIdeaCardStackStore } from '@/app/(with-sidebar)/issue/store/use-idea-card-stack-store';
import type { IdeaWithPosition, Position } from '@/app/(with-sidebar)/issue/types/idea';
import { ISSUE_STATUS } from '@/constants/issue';
import { useIdeaMutations, useSelectedIdeaMutation } from '@/hooks/issue';
import { useIdeasWithTemp } from './use-ideas-with-temp';
import { useIssueData } from './use-issue-data';
import { useIssueIdentity } from './use-issue-identity';

export function useIdeaOperations(issueId: string, isCreateIdeaActive: boolean) {
  // 통합된 아이디어 목록 (서버 + temp)
  const {
    ideas,
    tempIdea,
    hasEditingIdea,
    addTempIdea,
    deleteTempIdea,
    isError: isIdeasError,
  } = useIdeasWithTemp(issueId);
  const ideasRef = useRef(ideas);

  // z-index 관리
  const addCard = useIdeaCardStackStore(issueId, (state) => state.addCard);
  const removeCard = useIdeaCardStackStore(issueId, (state) => state.removeCard);
  const setInitialCardData = useIdeaCardStackStore(issueId, (state) => state.setInitialCardData);

  // 서버 mutation
  const { createIdea, updateIdea, removeIdea } = useIdeaMutations(issueId);

  // 현재 사용자 정보 가져오기
  const { members, isQuickIssue, status } = useIssueData(issueId);
  const { userId: currentUserId, nickname: currentUserNickname } = useIssueIdentity(issueId, {
    isQuickIssue,
    members,
  });

  const { mutate: selectIdea } = useSelectedIdeaMutation(issueId);

  // z-index 스택 초기화
  useEffect(() => {
    const ideaIds = ideas.map((idea) => idea.id);
    setInitialCardData(ideaIds);
  }, [ideas, setInitialCardData]);
  useEffect(() => {
    ideasRef.current = ideas;
  }, [ideas]);

  // 단계가 바뀌면 로컬 temp 아이디어 제거 (SSE 누락 대비)
  useEffect(() => {
    if (status !== ISSUE_STATUS.BRAINSTORMING && tempIdea) {
      deleteTempIdea();
    }
  }, [status, tempIdea, deleteTempIdea]);

  const handleCreateIdea = useCallback(async (position: Position) => {
    if (!isCreateIdeaActive) return;

    if (hasEditingIdea) {
      toast.error('입력 중인 아이디어가 있습니다.');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newIdea: IdeaWithPosition = {
      id: tempId,
      userId: currentUserId || '',
      content: '',
      author: currentUserNickname,
      categoryId: null,
      position,
      editable: true,
      isVoteButtonVisible: false,
      isVoteDisabled: false,
    };

    addTempIdea(newIdea);
    addCard(newIdea.id);
  }, [
    addCard,
    addTempIdea,
    currentUserId,
    currentUserNickname,
    hasEditingIdea,
    isCreateIdeaActive,
  ]);

  // 아이디어 저장
  const handleSaveIdea = useCallback((id: string, content: string) => {
    if (!id.startsWith('temp-')) return;

    const idea = ideasRef.current.find((i) => i.id === id);
    if (!idea) return;

    // mutation 성공 시에만 로컬 상태 업데이트
    createIdea(
      {
        content,
        userId: currentUserId!,
        positionX: idea.position?.x,
        positionY: idea.position?.y,
        categoryId: idea.categoryId,
      },
      {
        onSuccess: () => {
          // 성공 시 임시 아이디어 제거
          deleteTempIdea();
          removeCard(id);
          toast.success('아이디어가 저장되었습니다.');
        },
      },
    );
  }, [createIdea, currentUserId, deleteTempIdea, removeCard]);

  // 아이디어 삭제
  const handleDeleteIdea = useCallback(
    (id: string) => {
      if (id.startsWith('temp-')) {
        deleteTempIdea();
        removeCard(id);
        return;
      }

      removeIdea(id);
    },
    [deleteTempIdea, removeCard, removeIdea],
  );

  const handleSelectIdea = useCallback((id: string) => {
    selectIdea(id);
  }, [selectIdea]);

  const handleIdeaPositionChange = useCallback(
    (id: string, position: Position) => {
      // 작성중인 카드는 못움직이게 함
      if (id.startsWith('temp-')) return;

      // TanStack Query의 낙관적 업데이트가 자동으로 처리
      updateIdea({ ideaId: id, positionX: position.x, positionY: position.y, categoryId: null });
    },
    [updateIdea],
  );

  const handleMoveIdeaToCategory = useCallback(
    (ideaId: string, targetCategoryId: string | null) => {
      // temp 아이디어는 이 단계에서 존재하지 않는 것이 정상
      if (ideaId.startsWith('temp-')) return;

      // 카테고리화 이후 단계(VOTE, SELECT, CLOSE)에서는 카테고리 간 이동 불가
      if (
        status === ISSUE_STATUS.VOTE ||
        status === ISSUE_STATUS.SELECT ||
        status === ISSUE_STATUS.CLOSE
      ) {
        toast.error('카테고리화 이후에는 아이디어를 이동할 수 없습니다.');
        return;
      }

      const idea = ideas.find((i) => i.id === ideaId);
      if (!idea) return;

      const positionX = targetCategoryId === null ? (idea.position?.x ?? 100) : null;
      const positionY = targetCategoryId === null ? (idea.position?.y ?? 100) : null;

      updateIdea({
        ideaId,
        categoryId: targetCategoryId,
        positionX,
        positionY,
      });
    },
    [ideas, status, updateIdea],
  );

  return {
    ideas,
    isIdeasError,
    handleCreateIdea,
    handleSaveIdea,
    handleDeleteIdea,
    handleSelectIdea,
    handleIdeaPositionChange,
    handleMoveIdeaToCategory,
  };
}
