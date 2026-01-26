import { useCallback, useEffect, useState } from 'react';
import { useCategoryMutations } from '@/hooks';

interface UseCategoryProps {
  id: string;
  issueId: string;
  title: string;
}

export function useCategoryCard(props: UseCategoryProps) {
  const { id, issueId, title } = props;
  const [curTitle, setCurTitle] = useState<string>(title);
  const [draftTitle, setDraftTitle] = useState<string>(title);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { update } = useCategoryMutations(issueId);

  useEffect(() => {
    setCurTitle(title);
    setDraftTitle(title);
    setIsEditing(false);
  }, [title]);

  const submitEditedTitle = useCallback(
    (nextTitle: string) => {
      const value = nextTitle.trim();
      const finalTitle = value || curTitle;

      // 변경이 없으면 API 호출 안 함
      if (finalTitle === curTitle) {
        setIsEditing(false);
        return;
      }

      setCurTitle(finalTitle);
      setDraftTitle(finalTitle);
      setIsEditing(false);

      update.mutate({
        categoryId: id,
        payload: { title: finalTitle },
      });
    },
    [curTitle, id, update],
  );

  const cancelEditingTitle = () => {
    setDraftTitle(curTitle);
    setIsEditing(false);
  };

  return {
    curTitle,
    isEditing,
    draftTitle,
    setCurTitle,
    setDraftTitle,
    setIsEditing,
    submitEditedTitle,
    cancelEditingTitle,
  };
}
