'use client';

import { createContext, useContext } from 'react';
import type { KeyboardEvent } from 'react';
import type { Comment } from '@/lib/api/comment';

interface CommentWindowContextValue {
  comments: Comment[];
  errorMessage: string | null;
  isLoading: boolean;
  isMutating: boolean;
  mutatingCommentId: string | null;
  editingValue: string;
  setEditingValue: (value: string) => void;
  isCommentOwner: (commentUserId?: string) => boolean;
  isEditingComment: (commentId: string) => boolean;
  getSaveButtonContent: (commentId: string) => string;
  getDeleteButtonContent: (commentId: string) => string;
  shouldShowReadMore: (isExpanded: boolean, canExpand: boolean) => boolean;
  expandedCommentIds: string[];
  overflowCommentIds: string[];
  registerCommentBody: (commentId: string) => (node: HTMLDivElement | null) => void;
  registerCommentMeasure: (commentId: string) => (node: HTMLDivElement | null) => void;
  handleExpand: (commentId: string) => void;
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
