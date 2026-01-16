import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useSelectedIdeaMutation } from '@/app/(with-sidebar)/issue/hooks/queries/use-selected-idea-mutation';
import { useIdeaCardStackStore } from '@/app/(with-sidebar)/issue/store/use-idea-card-stack-store';
import { useIdeaStore } from '@/app/(with-sidebar)/issue/store/use-idea-store';
import type { IdeaWithPosition, Position } from '@/app/(with-sidebar)/issue/types/idea';
import { getUserIdForIssue } from '@/lib/storage/issue-user-storage';
import { IssueMember } from '@/types/issue';
import { useIdeasQuery } from './queries/use-ideas-query';
import { useIdeaMutations } from './use-idea-mutations';
import { useIssueData } from './use-issue-data';

export function useIdeaOperations(issueId: string, isCreateIdeaActive: boolean) {
  const { ideas, hasEditingIdea, addIdea, updateIdeaPosition, deleteIdea, setIdeas } =
    useIdeaStore(issueId);
  const tempIdeasRef = useRef<IdeaWithPosition[]>([]);

  const { addCard, removeCard, setInitialCardData } = useIdeaCardStackStore(issueId);
  const { createIdea, updateIdea, removeIdea } = useIdeaMutations(issueId);

  // 현재 사용자 정보 가져오기
  const { members } = useIssueData(issueId);
  const currentUserId = getUserIdForIssue(issueId);
  const currentUser = members.find((m: IssueMember) => m.id === currentUserId);
  const currentUserDisplayName = currentUser?.displayName || '나';

  const { data: ideasFromServer } = useIdeasQuery(issueId);
  const { mutate: selectIdea } = useSelectedIdeaMutation(issueId);

  useEffect(() => {
    const tempIdeas = ideas.filter((idea) => idea.id.startsWith('temp-'));
    tempIdeasRef.current = tempIdeas;
  }, [ideas]);

  useEffect(() => {
    if (!ideasFromServer) return;

    // 서버에서 받은 아이디어 + 현재 temp 아이디어
    const currentTempIdeas = tempIdeasRef.current;
    const serverIdeaIds = new Set(ideasFromServer.map((idea) => idea.id));
    const remainingTempIdeas = currentTempIdeas.filter((idea) => !serverIdeaIds.has(idea.id));

    setIdeas([...ideasFromServer, ...remainingTempIdeas]);
  }, [ideasFromServer, setIdeas]);

  useEffect(() => {
    const ideaIds = ideas.map((idea) => idea.id);
    setInitialCardData(ideaIds);
  }, [ideas, setInitialCardData]);

  const handleCreateIdea = async (position: Position) => {
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
      author: currentUserDisplayName,
      categoryId: null,
      position,
      editable: true,
      isVoteButtonVisible: false,
      isVoteDisabled: false,
    };

    addIdea(newIdea);
    addCard(newIdea.id);
  };

  // 아이디어 저장
  const handleSaveIdea = (id: string, content: string) => {
    if (!id.startsWith('temp-')) return;

    const idea = ideas.find((i) => i.id === id);
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
          deleteIdea(id);
          removeCard(id);
          toast.success('아이디어가 저장되었습니다.');
        },
      },
    );
  };

  // 아이디어 삭제
  const handleDeleteIdea = (id: string) => {
    if (id.startsWith('temp-')) {
      deleteIdea(id);
      removeCard(id);
      return;
    }

    removeIdea(id);
  };

  const handleSelectIdea = (id: string) => {
    selectIdea(id);
  };

  const handleIdeaPositionChange = (id: string, position: Position) => {
    if (id.startsWith('temp-')) return;

    // Zustand 스토어 즉시 업데이트 (낙관적 업데이트)
    // 이 코드가 없으면 React Query 캐시와 Zustand 상태가 불일치하여 UI가 튕기는 현상 발생...
    updateIdeaPosition(id, position);

    updateIdea({ ideaId: id, positionX: position.x, positionY: position.y, categoryId: null });
  };

  const handleVoteChange = (id: string, agreeCount: number, disagreeCount: number) => {
    const current = ideas.find((idea) => idea.id === id);
    if (!current) return;
    if (
      (current.agreeCount ?? 0) === agreeCount &&
      (current.disagreeCount ?? 0) === disagreeCount
    ) {
      return;
    }
    setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, agreeCount, disagreeCount } : idea)));
  };

  const handleMoveIdeaToCategory = (ideaId: string, targetCategoryId: string | null) => {
    // temp 아이디어는 이 단계에서 존재하지 않는 것이 정상
    if (ideaId.startsWith('temp-')) return;

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
  };

  return {
    ideas,
    handleCreateIdea,
    handleSaveIdea,
    handleDeleteIdea,
    handleSelectIdea,
    handleIdeaPositionChange,
    handleVoteChange,
    handleMoveIdeaToCategory,
  };
}
