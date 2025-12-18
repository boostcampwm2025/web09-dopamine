'use client';

import useCategory from './useCategoryCard';
import type { DragItemPayload } from './IdeaCard';
import {
  StyledCategoryCard,
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

interface CategoryCardProps {
  title: string;
  muted?: boolean;
  droppableId?: string;
  onItemDrop: (payload: DragItemPayload) => void;
  children: React.ReactNode;
  onRemove?: () => void;
}

export default function CategoryCard({
  title,
  muted = false,
  droppableId,
  onItemDrop,
  children,
  onRemove,
}: CategoryCardProps) {
  const {
    curTitle,
    isEditing,
    setIsEditing,
    draftTitle,
    setDraftTitle,
    submitEditedTitle,
    cancelEditingTitle,
    dropHandlers,
  } = useCategory({ title, droppableId, onItemDrop });

  return (
    <StyledCategoryCard
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
              onBlur={() => submitEditedTitle(draftTitle)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitEditedTitle(draftTitle);
                if (e.key === 'Escape') cancelEditingTitle();
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
    </StyledCategoryCard>
  );
}
