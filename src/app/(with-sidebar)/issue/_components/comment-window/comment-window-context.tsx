'use client';

import { createContext, useContext } from 'react';
import type { KeyboardEvent } from 'react';
import type { Comment } from '@/lib/api/comment';

interface CommentWindowContextValue {
  comments: Comment[];
  errorMessage: string | null;
  isMutating: boolean;
  mutatingCommentId: string | null;
  shouldShowLoading: boolean;
  shouldShowError: boolean;
  shouldShowEmpty: boolean;
  shouldShowComments: boolean;
  editingValue: string;
  setEditingValue: (value: string) => void;
  isCommentOwner: (commentUserId?: string) => boolean;
  isEditingComment: (commentId: string) => boolean;
  getSaveButtonContent: (commentId: string) => string;
  getDeleteButtonContent: (commentId: string) => string;
  shouldShowReadMore: (isExpanded: boolean, canExpand: boolean) => boolean;
  handleEditStart: (comment: Comment) => void;
  handleEditCancel: () => void;
  handleEditSave: () => void;
  handleEditKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  handleDelete: (commentId: string) => void;
}

export const CommentWindowContext = createContext<CommentWindowContextValue | null>(null);

export function useCommentWindowContext() {
  const context = useContext(CommentWindowContext);
  if (!context) {
    throw new Error('CommentWindowContext is missing');
  }
  return context;
}
