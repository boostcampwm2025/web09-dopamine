'use client';

import { useEffect, useState } from 'react';
import * as S from './comment-window.styles';
import { useWindow } from './hooks/use-window';
import { createComment, fetchComments, type Comment } from '@/lib/api/comment';

export interface CommentWindowProps {
  ideaId: string;
  userId: string;
  initialPosition?: { x: number; y: number };
  onClose?: () => void;
  width?: number | string;
  height?: number | string;
}

export default function CommentWindow({
  ideaId,
  userId,
  initialPosition,
  onClose,
  width = 420,
  height,
}: CommentWindowProps) {
  const { position } = useWindow({ initialPosition });
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!ideaId) {
      setComments([]);
      setErrorMessage('아이디어 정보가 없어 댓글을 불러올 수 없습니다.');
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setErrorMessage(null);

    fetchComments(ideaId)
      .then((data) => {
        if (!isActive) return;
        setComments(data);
      })
      .catch((error) => {
        if (!isActive) return;
        setErrorMessage(error instanceof Error ? error.message : '댓글을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [ideaId]);

  const formatRelativeTime = (createdAt: Date | string) => {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) {
      return '작성 시간 정보 없음';
    }
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60_000) return '방금 전';
    const diffMinutes = Math.floor(diffMs / 60_000);
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}일 전`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}개월 전`;
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears}년 전`;
  };

  const renderMeta = (comment: Comment) => {
    const author =
      comment.user?.displayName || comment.user?.name || '익명';
    const timeText = formatRelativeTime(comment.createdAt);
    return `${author} · ${timeText}`;
  };

  const handleSubmit = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !ideaId || !userId || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await createComment(ideaId, { userId, content: trimmed });
      setComments((prev) => [...prev, created]);
      setInputValue('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '댓글을 등록하지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <S.CommentList>
            {isLoading ? (
              <S.CommentItem>
                <S.CommentMeta>댓글을 불러오는 중...</S.CommentMeta>
              </S.CommentItem>
            ) : null}
            {!isLoading && errorMessage ? (
              <S.CommentItem>
                <S.CommentMeta>{errorMessage}</S.CommentMeta>
              </S.CommentItem>
            ) : null}
            {!isLoading && !errorMessage && comments.length === 0 ? (
              <S.CommentItem>
                <S.CommentMeta>등록된 댓글이 없습니다.</S.CommentMeta>
              </S.CommentItem>
            ) : null}
            {!isLoading && !errorMessage
              ? comments.map((comment) => (
                  <S.CommentItem key={comment.id}>
                    <S.CommentMeta>{renderMeta(comment)}</S.CommentMeta>
                    <S.CommentBody>{comment.content}</S.CommentBody>
                  </S.CommentItem>
                ))
              : null}
          </S.CommentList>
        </S.Section>
        <S.Divider />
        <S.Section>
          <S.InputRow>
            <S.Input
              placeholder="답변"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={isSubmitting}
            />
            <S.SubmitButton type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '제출'}
            </S.SubmitButton>
          </S.InputRow>
        </S.Section>
      </S.Body>
    </S.Window>
  );
}
