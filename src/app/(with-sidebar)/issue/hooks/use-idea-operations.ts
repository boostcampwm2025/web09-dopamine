import toast from 'react-hot-toast';
import { useIdeaStore } from '@/app/(with-sidebar)/issue/store/use-idea-store';
import { useIdeaCardStackStore } from '@/app/(with-sidebar)/issue/store/use-idea-card-stack-store';
import type { IdeaWithPosition, Position } from '@/app/(with-sidebar)/issue/types/idea';

export function useIdeaOperations(issueId: string, isCreateIdeaActive: boolean) {
  const {
    ideas,
    hasEditingIdea,
    resetEditingIdea,
    addIdea,
    updateIdeaContent,
    updateIdeaPosition,
    deleteIdea,
    setIdeas,
    selectIdea,
  } = useIdeaStore(issueId);

  const { addCard, removeCard } = useIdeaCardStackStore(issueId);

  const handleCreateIdea = (position: Position) => {
    if (!isCreateIdeaActive) return;

    if (hasEditingIdea) {
      toast.error('입력 중인 아이디어가 있습니다.');
      return;
    }

    const newIdea: IdeaWithPosition = {
      id: `idea-${Date.now()}`,
      content: '',
      author: '나',
      categoryId: null,
      position,
      editable: true,
      isVotePhase: false,
    };

    addIdea(newIdea);
    addCard(newIdea.id);
  };

  const handleSaveIdea = (id: string, content: string) => {
    updateIdeaContent(id, content);
  };

  const handleDeleteIdea = (id: string) => {
    if (hasEditingIdea) {
      resetEditingIdea();
    }
    deleteIdea(id);
    removeCard(id);
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
    setIdeas(
      ideas.map((idea) => (idea.id === id ? { ...idea, agreeCount, disagreeCount } : idea)),
    );
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
