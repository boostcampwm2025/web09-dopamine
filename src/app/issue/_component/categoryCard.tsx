'use client';

import useCategory from './useCategoryCard';
import type { DragItemPayload } from './IdeaCard';
import {
  StyledCategoryCar,
  Header,
  HeaderLeft,
  Actions,
  Dot,
  Title,
  Input,
  Btn,
  DangerBtn,
  ChildrenWrapper,
} from './categoryCard.style';



interface CategoryCarProps {
  title: string;
  muted?: boolean;
  droppableId?: string;
  onItemDrop?: (payload: DragItemPayload) => void;
  children: React.ReactNode;
  onRemove?: () => void;
}

export default function CategoryCar({
  title,
  muted = false,
  droppableId,
  onItemDrop,
  children,
  onRemove,
}: CategoryCarProps) {
  const {
    curTitle,
    isEditing,
    setIsEditing,
    draftTitle,
    setDraftTitle,
    save,
    cancel,
    dropHandlers,
  } = useCategory({ title, droppableId, onItemDrop });

  return (
    <StyledCategoryCar
      muted={muted}
      aria-label={`${curTitle} 카테고리`}
      {...dropHandlers}
    >
      <Header muted={muted}>
        <HeaderLeft>
          <Dot muted={muted} />
          {isEditing ? (
            <Input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={() => save(draftTitle)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save(draftTitle);
                if (e.key === 'Escape') cancel();
              }}
              autoFocus
            />
          ) : (
            <Title muted={muted}>{curTitle}</Title>
          )}
        </HeaderLeft>
        {!isEditing && (
          <Actions>
            <Btn onClick={() => setIsEditing(true)} muted={muted}>
              수정
            </Btn>
            {onRemove && (
              <DangerBtn onClick={() => onRemove()} muted={muted}>
                삭제
              </DangerBtn>
            )}
          </Actions>
        )}
      </Header>
      <ChildrenWrapper>{children}</ChildrenWrapper>
    </StyledCategoryCar>
  );
}
