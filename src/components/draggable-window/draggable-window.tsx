'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import * as S from './draggable-window.styles';
import { useDraggableWindow } from './hooks/use-draggable-window';

export interface DraggableWindowProps {
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  onClose?: () => void;
  width?: number | string;
  height?: number | string;
  draggable?: boolean;
}

export default function DraggableWindow({
  title,
  children,
  initialPosition,
  onClose,
  width = 420,
  height,
  draggable = true,
}: DraggableWindowProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const { position, handleMouseDown } = useDraggableWindow({ initialPosition, draggable });

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  if (!portalTarget) return null;

  return createPortal(
    <S.Window
      role="dialog"
      aria-label={title}
      style={{ left: position.x, top: position.y, width, height }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <S.Header onMouseDown={handleMouseDown}>
        <S.Title>{title}</S.Title>
        <S.Controls>
          <S.CloseButton type="button" aria-label="Close" onClick={onClose}>
            &times;
          </S.CloseButton>
        </S.Controls>
      </S.Header>
      <S.Body>{children}</S.Body>
    </S.Window>,
    portalTarget,
  );
}
