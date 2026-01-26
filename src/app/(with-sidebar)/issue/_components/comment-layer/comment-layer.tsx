'use client';

import { useIssueId, useIssueIdentity } from '../../hooks';
import { useCommentWindowStore } from '../../store/use-comment-window-store';
import { useCanvasContext } from '../canvas/canvas-context';
import CommentWindow from '../comment-window/comment-window';
import * as S from './comment-layer.styles';

export default function CommentLayer() {
  const issueId = useIssueId();
  const { userId } = useIssueIdentity(issueId);
  const { activeCommentId, commentPosition } = useCommentWindowStore();
  const closeComment = useCommentWindowStore((s) => s.closeComment);

  if (!activeCommentId) return null;

  return (
    <S.CommentLayer>
      <CommentWindow
        issueId={issueId}
        ideaId={activeCommentId}
        userId={userId}
        initialPosition={commentPosition}
        // scale={scale}
        onClose={closeComment}
      />
    </S.CommentLayer>
  );
}
