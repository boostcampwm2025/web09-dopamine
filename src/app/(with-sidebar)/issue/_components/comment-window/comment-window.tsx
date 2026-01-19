'use client';

import * as S from './comment-window.styles';
import { useWindow } from './hooks/use-window';

export interface CommentWindowProps {
  initialPosition?: { x: number; y: number };
  onClose?: () => void;
  width?: number | string;
  height?: number | string;
}

export default function CommentWindow({
  initialPosition,
  onClose,
  width = 420,
  height,
}: CommentWindowProps) {
  const { position } = useWindow({ initialPosition });

  return (
    <S.Window
      role="dialog"
      aria-label="댓글"
      style={{ left: position.x, top: position.y, width, height }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <S.Header>
        <S.Title>댓글</S.Title>
        <S.Controls>
          <S.CloseButton type="button" aria-label="Close" onClick={onClose}>
            &times;
          </S.CloseButton>
        </S.Controls>
      </S.Header>
      <S.Body>
        <S.Section>
          <S.SectionTitle>댓글 리스트</S.SectionTitle>
          <S.CommentList>
            <S.CommentItem>
              <S.CommentMeta>댓글 작성자 | 작성되고 경과시간</S.CommentMeta>
              <S.CommentBody>댓글 내용</S.CommentBody>
            </S.CommentItem>
          </S.CommentList>
        </S.Section>
        <S.Divider />
        <S.Section>
          <S.SectionTitle>댓글 입력</S.SectionTitle>
          <S.InputRow>
            <S.Input placeholder="답변 input" />
            <S.SubmitButton type="button">제출 버튼</S.SubmitButton>
          </S.InputRow>
        </S.Section>
      </S.Body>
    </S.Window>
  );
}
