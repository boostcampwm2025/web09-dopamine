'use client';

import { createContext, useContext } from 'react';
import type { KeyboardEvent } from 'react';
import type { Comment } from '@/lib/api/comment';

interface CommentListContextValue {
  isMutating: boolean;
  mutatingCommentId: string | null;
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
  expandedCommentIds: string[];
  overflowCommentIds: string[];
  registerCommentBody: (commentId: string) => (node: HTMLDivElement | null) => void;
  registerCommentMeasure: (commentId: string) => (node: HTMLDivElement | null) => void;
  handleExpand: (commentId: string) => void;
}

export const CommentListContext = createContext<CommentListContextValue | null>(null);

export function useCommentListContext() {
  const context = useContext(CommentListContext);
  if (!context) {
    throw new Error('CommentListContext is missing');
  }
  return context;
}
