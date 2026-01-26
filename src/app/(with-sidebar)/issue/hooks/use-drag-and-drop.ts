import { useState } from 'react';
import { DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { IdeaWithPosition, Position } from '@/app/(with-sidebar)/issue/types/idea';
import { useCommentWindowStore } from '../store/use-comment-window-store';

interface UseDragAndDropProps {
  ideas: IdeaWithPosition[];
  scale: number;
  onIdeaPositionChange: (id: string, position: Position) => void;
  onMoveIdeaToCategory: (ideaId: string, targetCategoryId: string | null) => void;
}

export function useDragAndDrop({
  ideas,
  scale,
  onIdeaPositionChange,
  onMoveIdeaToCategory,
}: UseDragAndDropProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayEditValue, setOverlayEditValue] = useState<string | null>(null);

  const { activeCommentId, commentPosition } = useCommentWindowStore();
  const openComment = useCommentWindowStore((s) => s.openComment);

  // dnd-kit sensors 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이동해야 드래그 시작
      },
    }),
  );

  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);

    const editValue = event.active.data?.current?.editValue;
    if (editValue) {
      setOverlayEditValue(editValue);
    }
  };

  // 드래그 종료
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveId(null);
    setOverlayEditValue(null);

    const ideaId = active.id as string;
    const idea = ideas.find((i) => i.id === ideaId);

    if (!idea) return;

    // 카테고리로 드롭한 경우
    if (over && over.data?.current?.type === 'category') {
      onMoveIdeaToCategory(ideaId, over.data.current.categoryId as string);
    }
    // 자유 배치 영역 (over가 없거나 카테고리가 아닌 경우)
    else if (idea.position) {
      // delta는 화면 픽셀 단위이므로 Canvas scale로 나눠서 보정
      onIdeaPositionChange(ideaId, {
        x: idea.position.x + delta.x / scale,
        y: idea.position.y + delta.y / scale,
      });
    }

    if (activeCommentId && active.id === activeCommentId && commentPosition) {
      // 줌 스케일 고려해서 이동 거리 계산
      const newX = commentPosition.x + delta.x / scale;
      const newY = commentPosition.y + delta.y / scale;

      // 댓글창 위치 업데이트
      openComment(activeCommentId, { x: newX, y: newY });
    }
  };

  return {
    sensors,
    activeId,
    overlayEditValue,
    handleDragStart,
    handleDragEnd,
  };
}
