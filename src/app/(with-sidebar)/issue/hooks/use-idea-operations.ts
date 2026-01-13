import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useIdeaCardStackStore } from '@/app/(with-sidebar)/issue/store/use-idea-card-stack-store';
import { useIdeaStore } from '@/app/(with-sidebar)/issue/store/use-idea-store';
import type { IdeaWithPosition, Position } from '@/app/(with-sidebar)/issue/types/idea';
import { createIdea, deleteIdea as deleteIdeaAPI, fetchIdeas } from '@/lib/api/idea';
import { getTempUserId } from '@/lib/utils/temp-user';

export function useIdeaOperations(issueId: string, isCreateIdeaActive: boolean) {
  const {
    ideas,
    hasEditingIdea,
    addIdea,
    updateIdeaContent,
    updateIdeaPosition,
    deleteIdea,
    setIdeas,
    selectIdea,
  } = useIdeaStore(issueId);

  const { addCard, removeCard, setInitialCardData } = useIdeaCardStackStore(issueId);

  useEffect(() => {
    const loadIdeas = async () => {
      const fetchedIdeas = await fetchIdeas(issueId);
      if (fetchedIdeas.length > 0) {
        const ideasWithPosition: IdeaWithPosition[] = fetchedIdeas.map((idea) => ({
          ...idea,
          author: idea.user?.displayName || idea.user?.name || '익명',
          position: idea.positionX && idea.positionY 
            ? { x: idea.positionX, y: idea.positionY }
            : null,
          editable: false,
        }));
        setIdeas(ideasWithPosition);
      }
    };
    loadIdeas();
  }, [issueId, setIdeas]);

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
      content: '',
      author: '나',
      categoryId: null,
      position,
      editable: true,
      isVotePhase: false,
      isVoteEnded: false,
    };

    addIdea(newIdea);
    addCard(newIdea.id);
  };

  const handleSaveIdea = async (id: string, content: string) => {
    if (!id.startsWith('temp-')) {
      updateIdeaContent(id, content);
      return;
    }

    try {
      const userId = getTempUserId(); // localStroage에 저장된 임시 사용자 ID
      const idea = ideas.find((idea) => idea.id === id);

      const createdIdea = await createIdea(issueId, {
        content,
        userId,
        positionX: idea?.position?.x,
        positionY: idea?.position?.y,
        categoryId: idea?.categoryId || undefined,
      });

      // 임시 ID를 실제 ID로 교체
      const updatedIdeas = ideas.map((idea) => {
        if (idea.id !== id) return idea;
        return {
          ...idea,
          id: createdIdea.id,
          content: createdIdea.content,
          editable: false,
        };
      });
      setIdeas(updatedIdeas);

      removeCard(id);
      addCard(createdIdea.id);

      toast.success('아이디어가 저장되었습니다.');
    } catch (error) {
      console.error('아이디어 저장 실패:', error);
      toast.error('아이디어 저장에 실패했습니다.');
      deleteIdea(id);
      removeCard(id);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    if (id.startsWith('temp-')) {
      deleteIdea(id);
      removeCard(id);
      return;
    }

    const ideaToDelete = ideas.find((idea) => idea.id === id);
    if (!ideaToDelete) return;

    deleteIdea(id);
    removeCard(id);

    try {
      await deleteIdeaAPI(issueId, id);
      toast.success('아이디어가 삭제되었습니다.');
    } catch (error) {
      console.error('아이디어 삭제 실패:', error);
      toast.error('아이디어 삭제에 실패했습니다.');
      
      // 롤백: 삭제된 아이디어를 다시 추가
      addIdea(ideaToDelete);
      addCard(id);
    }
  };

  const handleSelectIdea = (id: string) => {
    selectIdea(id);
  };

  const handleIdeaPositionChange = (id: string, position: Position) => {
    updateIdeaPosition(id, position);
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
    setIdeas(
      ideas.map((idea) =>
        idea.id === ideaId
          ? {
              ...idea,
              categoryId: targetCategoryId,
              position: targetCategoryId === null ? idea.position || { x: 100, y: 100 } : null,
            }
          : idea,
      ),
    );
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
