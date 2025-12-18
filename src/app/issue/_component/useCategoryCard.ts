import { useEffect, useState, useMemo, useCallback } from 'react';
import { DragItemPayload } from './IdeaCard';

interface UseCategoryProps {
  title: string;
  onItemDrop?: (payload: DragItemPayload) => void;
  droppableId?: string;
}

export default function useCategory(props: UseCategoryProps) {
  const { title, onItemDrop, droppableId } = props;
  const [curTitle, setCurTitle] = useState<string>(title);
  const [draftTitle, setDraftTitle] = useState<string>(title);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    setCurTitle(title);
    setDraftTitle(title);
    setIsEditing(false);
  }, [title]);

  const save = (nextTitle: string) => {
    const value = nextTitle.trim();
    setCurTitle(value || curTitle);
    setDraftTitle(value || curTitle);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraftTitle(curTitle);
    setIsEditing(false);
  };

  const dropHandlers = useMemo(() => {
    if (!droppableId || !onItemDrop) return {};
    return {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData('application/json');
        if (!raw) return;
        try {
          const payload = JSON.parse(raw) as DragItemPayload;
          onItemDrop(payload);
        } catch {
          // ignore malformed payload
        }
      },
    };
  }, [droppableId, onItemDrop]);

  return {
    curTitle,
    isEditing,
    draftTitle,
    setCurTitle,
    setDraftTitle,
    setIsEditing,
    save,
    cancel,
    dropHandlers,
  };
}