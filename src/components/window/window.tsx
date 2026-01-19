'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import * as S from './window-styles';
import { useWindow } from './hooks/use-window';

export interface WindowProps {
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  onClose?: () => void;
  width?: number | string;
  height?: number | string;
}

export default function Window({
  title,
  children,
  initialPosition,
  onClose,
  width = 420,
  height,
}: WindowProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const { position } = useWindow({ initialPosition });

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
      <S.Header>
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