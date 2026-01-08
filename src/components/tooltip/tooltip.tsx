'use client';

import { useRef } from 'react';
import { arrow, autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';
import { createPortal } from 'react-dom';
import * as S from './tooltip.styles';
import { useTooltipStore } from './use-tooltip-store';

export default function Tooltip() {
  const { isOpen, targetNode, text } = useTooltipStore();
  const arrowRef = useRef(null);

  const { refs, floatingStyles, middlewareData, placement } = useFloating({
    placement: 'bottom',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    elements: {
      reference: isOpen ? targetNode : null,
    },
    middleware: [
      offset(10), // 20px 간격
      flip(), // 공간 없으면 위로 뒤집기
      shift(), // 화면 옆으로 안 잘리게 밀기
      arrow({
        element: arrowRef,
      }),
    ],
  });

  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;

  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[placement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left'];

  if (!isOpen || !targetNode || !targetNode.isConnected) return null;

  return createPortal(
    <S.Container
      ref={refs.setFloating}
      style={floatingStyles}
    >
      {text}
      <S.Arrow
        ref={arrowRef}
        style={{
          left: arrowX != null ? `${arrowX}px` : '',
          top: arrowY != null ? `${arrowY}px` : '',
          [staticSide]: '-5px',
        }}
      />
    </S.Container>,
    document.body,
  );
}
