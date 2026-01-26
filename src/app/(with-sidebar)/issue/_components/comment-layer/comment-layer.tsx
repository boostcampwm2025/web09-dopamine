'use client';

import { useDndContext } from '@dnd-kit/core';
import { useIssueId, useIssueIdentity } from '../../hooks';
import { useCommentWindowStore } from '../../store/use-comment-window-store';
import CommentWindow from '../comment-window/comment-window';
import * as S from './comment-layer.styles';

export default function CommentLayer() {
  const issueId = useIssueId();
  const { userId } = useIssueIdentity(issueId);

  const { activeCommentId } = useCommentWindowStore();
  const closeComment = useCommentWindowStore((s) => s.closeComment);

  const { active } = useDndContext();
  if (active && active.id === activeCommentId) {
    return null;
  }

  if (!activeCommentId) return null;

  return (
    <S.CommentLayer>
      <CommentWindow
        issueId={issueId}
        ideaId={activeCommentId}
        userId={userId}
        onClose={closeComment}
      />
    </S.CommentLayer>
  );
}
