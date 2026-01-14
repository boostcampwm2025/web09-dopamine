import { useCallback, useEffect, useState } from 'react';

interface UseCategoryProps {
  title: string;
  onTitleChange?: (newTitle: string) => void;
}

export default function useCategory(props: UseCategoryProps) {
  const { title, onTitleChange } = props;
  const [curTitle, setCurTitle] = useState<string>(title);
  const [draftTitle, setDraftTitle] = useState<string>(title);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    setCurTitle(title);
    setDraftTitle(title);
    setIsEditing(false);
  }, [title]);

  const submitEditedTitle = useCallback(
    (nextTitle: string) => {
      const value = nextTitle.trim();
      const finalTitle = value || curTitle;
      setCurTitle(finalTitle);
      setDraftTitle(finalTitle);
      setIsEditing(false);

      // 서버에 변경사항 전달

      // Zustand 스토어 업데이트
      onTitleChange?.(finalTitle);
    },
    [curTitle, onTitleChange],
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
