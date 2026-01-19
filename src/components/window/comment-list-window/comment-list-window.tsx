'use client';

import DraggableWindow from '../window';
import * as S from './comment-list-window.styles';

interface CommentListWindowProps {
  initialPosition?: { x: number; y: number };
  onClose?: () => void;
}

export default function CommentListWindow({ initialPosition, onClose }: CommentListWindowProps) {
  return (
    <DraggableWindow title="댓글" initialPosition={initialPosition} onClose={onClose}>
      <S.Section>
        <S.CommentList>
          <S.CommentItem>
            <S.CommentMeta>댓글 작성자 | 작성되고 경과시간</S.CommentMeta>
            <S.CommentBody>댓글 내용</S.CommentBody>
          </S.CommentItem>
        </S.CommentList>
      </S.Section>
      <S.Divider />
      <S.Section>
        <S.InputRow>
          <S.Input placeholder="답변" />
          <S.SubmitButton type="button">제출 버튼</S.SubmitButton>
        </S.InputRow>
      </S.Section>
    </DraggableWindow>
  );
}
