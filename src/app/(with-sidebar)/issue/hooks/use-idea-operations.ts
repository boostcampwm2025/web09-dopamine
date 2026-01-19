import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useIdeaMutations } from '@/app/(with-sidebar)/issue/hooks/react-query/use-idea-mutations';
import { useSelectedIdeaMutation } from '@/app/(with-sidebar)/issue/hooks/react-query/use-selected-idea-mutation';
import { useIdeaCardStackStore } from '@/app/(with-sidebar)/issue/store/use-idea-card-stack-store';
import type { IdeaWithPosition, Position } from '@/app/(with-sidebar)/issue/types/idea';
import { getUserIdForIssue } from '@/lib/storage/issue-user-storage';
import { IssueMember } from '@/types/issue';
import { useIdeasWithTemp } from './use-ideas-with-temp';
import { useIssueData } from './use-issue-data';

export function useIdeaOperations(issueId: string, isCreateIdeaActive: boolean) {
  // 통합된 아이디어 목록 (서버 + temp)
  const { ideas, hasEditingIdea, addTempIdea, deleteTempIdea, isError: isIdeasError } = useIdeasWithTemp(issueId);

  // z-index 관리
  const { addCard, removeCard, setInitialCardData } = useIdeaCardStackStore(issueId);

  // 서버 mutation
  const { createIdea, updateIdea, removeIdea } = useIdeaMutations(issueId);

  // 현재 사용자 정보 가져오기
  const { members } = useIssueData(issueId);
  const currentUserId = getUserIdForIssue(issueId);
  const currentUser = members.find((m: IssueMember) => m.id === currentUserId);
  const currentUserDisplayName = currentUser?.displayName || '나';

  const { mutate: selectIdea } = useSelectedIdeaMutation(issueId);

  // z-index 스택 초기화
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

    addTempIdea(newIdea);
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
          deleteTempIdea();
          removeCard(id);
          toast.success('아이디어가 저장되었습니다.');
        },
      },
    );
  };

  // 아이디어 삭제
  const handleDeleteIdea = (id: string) => {

    if (id.startsWith('temp-')) {
      deleteTempIdea();
      removeCard(id);
      return;
    }

    removeIdea(id);
  };

  const handleSelectIdea = (id: string) => {
    selectIdea(id);
  };

  const handleIdeaPositionChange = (id: string, position: Position) => {
    // 작성중인 카드는 못움직이게 함
    if (id.startsWith('temp-')) return;

    // TanStack Query의 낙관적 업데이트가 자동으로 처리
    updateIdea({ ideaId: id, positionX: position.x, positionY: position.y, categoryId: null });
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
    isIdeasError,
    handleCreateIdea,
    handleSaveIdea,
    handleDeleteIdea,
    handleSelectIdea,
    handleIdeaPositionChange,
    handleMoveIdeaToCategory,
  };
}
