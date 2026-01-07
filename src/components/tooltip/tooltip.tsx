'use client';

import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';
import { createPortal } from 'react-dom';
import * as S from './tooltip.style';
import { useTooltipStore } from './use-tooltip-store';

export default function Tooltip() {
  const { isOpen, targetNode, text } = useTooltipStore();

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    elements: {
      reference: isOpen ? targetNode : null,
    },
    middleware: [
      offset(20), // 20px 간격
      flip(), // 공간 없으면 위로 뒤집기
      shift(), // 화면 옆으로 안 잘리게 밀기
    ],
  });

  if (!isOpen || !targetNode || !targetNode.isConnected) return null;

  return createPortal(
    <S.Container
      ref={refs.setFloating}
      style={floatingStyles}
    >
      {text}
    </S.Container>,
    document.body,
  );
}
