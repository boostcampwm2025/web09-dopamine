'use client';

import {
  Actions,
  Btn,
  DangerBtn,
  Dot,
  Header,
  HeaderLeft,
  Input,
  Title,
} from './category-card.styles';

interface CategoryCardHeaderProps {
  curTitle: string;
  draftTitle: string;
  isEditing: boolean;
  isMuted: boolean;
  onStartEdit: () => void;
  onChangeTitle: (value: string) => void;
  onSubmitTitle: (value: string) => void;
  onCancelEdit: () => void;
  onRemove?: () => void;
  onMouseDown?: (event: React.MouseEvent) => void;
}

export default function CategoryCardHeader({
  curTitle,
  draftTitle,
  isEditing,
  isMuted,
  onStartEdit,
  onChangeTitle,
  onSubmitTitle,
  onCancelEdit,
  onRemove,
  onMouseDown,
}: CategoryCardHeaderProps) {
  return (
    <Header
      isMuted={isMuted}
      onMouseDown={onMouseDown}
    >
      <HeaderLeft>
        <Dot isMuted={isMuted} />
        {isEditing ? (
          <Input
            value={draftTitle}
            onChange={(e) => onChangeTitle(e.target.value)}
            onBlur={() => onSubmitTitle(draftTitle)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmitTitle(draftTitle);
              if (e.key === 'Escape') onCancelEdit();
            }}
            autoFocus
          />
        ) : (
          <Title isMuted={isMuted}>{curTitle}</Title>
        )}
      </HeaderLeft>
      {!isEditing && (
        <Actions>
          <Btn
            onClick={onStartEdit}
            isMuted={isMuted}
          >
            수정
          </Btn>
          {onRemove && (
            <DangerBtn
              onClick={onRemove}
              isMuted={isMuted}
            >
              삭제
            </DangerBtn>
          )}
        </Actions>
      )}
    </Header>
  );
}
