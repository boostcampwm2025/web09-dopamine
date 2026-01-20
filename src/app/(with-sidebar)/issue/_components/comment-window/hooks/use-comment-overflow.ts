'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCommentOverflowOptions<T extends { id: string }> {
  items: T[];
}

export function useCommentOverflow<T extends { id: string }>({
  items,
}: UseCommentOverflowOptions<T>) {
  const [expandedCommentIds, setExpandedCommentIds] = useState<string[]>([]);
  const [overflowCommentIds, setOverflowCommentIds] = useState<string[]>([]);
  const commentBodyRefs = useRef(new Map<string, HTMLDivElement | null>());
  const commentMeasureRefs = useRef(new Map<string, HTMLDivElement | null>());

  const handleExpand = useCallback((commentId: string) => {
    setExpandedCommentIds((prev) => (prev.includes(commentId) ? prev : [...prev, commentId]));
  }, []);

  const registerCommentBody = useCallback(
    (commentId: string) => (node: HTMLDivElement | null) => {
      commentBodyRefs.current.set(commentId, node);
    },
    [],
  );

  const registerCommentMeasure = useCallback(
    (commentId: string) => (node: HTMLDivElement | null) => {
      commentMeasureRefs.current.set(commentId, node);
    },
    [],
  );

  const measureOverflow = useCallback(() => {
    const next = new Set<string>();
    commentMeasureRefs.current.forEach((measureNode, commentId) => {
      const bodyNode = commentBodyRefs.current.get(commentId);
      if (!measureNode || !bodyNode) return;
      const fullHeight = measureNode.offsetHeight;
      const clampedHeight = bodyNode.clientHeight;
      if (fullHeight > clampedHeight + 1) next.add(commentId);
    });

    setOverflowCommentIds((prev) => {
      if (prev.length === next.size && prev.every((id) => next.has(id))) {
        return prev;
      }
      return Array.from(next);
    });
  }, []);

  useEffect(() => {
    measureOverflow();
  }, [items, expandedCommentIds, measureOverflow]);

  useEffect(() => {
    const handleResize = () => measureOverflow();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [measureOverflow]);

  return {
    expandedCommentIds,
    overflowCommentIds,
    registerCommentBody,
    registerCommentMeasure,
    handleExpand,
  };
}
