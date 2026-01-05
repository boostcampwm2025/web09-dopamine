'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { CanvasContext } from './canvas-context';
import {
  AddIdeaButton,
  BottomMessage,
  CanvasContainer,
  CanvasViewport,
  ZoomButton,
  ZoomControls,
} from './canvas.styles';

interface CanvasProps {
  children?: React.ReactNode;
  onDoubleClick?: (position: { x: number; y: number }) => void;
}

const DEFAULT_ZOOM_SCALE = 0.7;
const DEFAULT_OFFSET = { x: 0, y: 0 };

export default function Canvas({ children, onDoubleClick }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // 패닝(드래그 이동) 상태 관리
  const [isPanning, setIsPanning] = useState(false); // 현재 패닝 중인지 여부
  const [panStart, setPanStart] = useState(DEFAULT_OFFSET); // 패닝 시작 지점
  const [offset, setOffset] = useState(DEFAULT_OFFSET); // 캔버스 이동 오프셋
  const [scale, setScale] = useState(DEFAULT_ZOOM_SCALE); // 확대/축소 비율 (0.3 ~ 3.0)

  /**
   * 마우스 휠 이벤트 핸들러
   * - Ctrl/Cmd + 휠: 줌 인/아웃 (0.3x ~ 3.0x)
   * - 일반 휠: 캔버스 패닝
   */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // 줌 기능
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      setScale((prev) => Math.min(Math.max(0.3, prev + delta), 3));
    } else {
      // 패닝 기능
      setOffset((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, []);

  /**
   * 마우스 다운 이벤트 핸들러
   * - 중간 마우스 버튼(휠 클릭) 또는 Shift + 좌클릭으로 패닝 시작
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && !e.shiftKey)) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    },
    [offset],
  );

  /**
   * 마우스 이동 이벤트 핸들러
   * - 패닝 중일 때 캔버스 위치 업데이트
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    },
    [isPanning, panStart],
  );

  /**
   * 마우스 업 이벤트 핸들러
   * - 패닝 종료
   */
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  /** 줌 인 (+10%) */
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  /** 줌 아웃 (-10%) */
  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.3));
  };
기본값으로 복귀) */
  const handleResetZoom = () => {
    setScale(DEFAULT_ZOOM_SCALE);
    setOffset(DEFAULT_OFFSET
    setOffset({ x: 0, y: 0 });
  };

  const handleCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!onDoubleClick) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // 클릭 위치를 캔버스 좌표계로 변환
      const x = (e.clientX - rect.left - offset.x) / scale;
      const y = (e.clientY - rect.top - offset.y) / scale;

      onDoubleClick({ x, y });
    },
    [onDoubleClick, offset, scale],
  );

  return (
    <>
      <CanvasContainer
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleCanvasDoubleClick}
        style={{
          cursor: isPanning ? 'grabbing' : 'default',
        }}
      >
        <CanvasViewport
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        >
          <CanvasContext.Provider value={{ scale }}>{children}</CanvasContext.Provider>
        </CanvasViewport>
      </CanvasContainer>

      <ZoomControls>
        <ZoomButton
          onClick={handleZoomIn}
          title="확대"
        >
          <Image
            src="/add.svg"
            alt="확대"
            width={20}
            height={20}
          />
        </ZoomButton>
        <ZoomButton
          onClick={handleResetZoom}
          title="초기화"
        >
          {Math.round(scale * 100)}%
        </ZoomButton>
        <ZoomButton
          onClick={handleZoomOut}
          title="축소"
        >
          <Image
            src="/minus.svg"
            alt="확대"
            width={20}
            height={20}
          />
        </ZoomButton>
      </ZoomControls>
      <AddIdeaButton>아이디어 추가</AddIdeaButton>
      <BottomMessage>배경을 더블클릭하여 새로운 아이디어를 작성할 수 있습니다.</BottomMessage>
    </>
  );
}
