import Image from 'next/image';
import { ZoomButton, ZoomControls } from './canvas.styles';

interface CanvasZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export default function CanvasZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}: CanvasZoomControlsProps) {
  return (
    <ZoomControls>
      <ZoomButton
        onClick={onZoomIn}
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
        onClick={onReset}
        title="초기화"
      >
        {Math.round(scale * 100)}%
      </ZoomButton>
      <ZoomButton
        onClick={onZoomOut}
        title="축소"
      >
        <Image
          src="/minus.svg"
          alt="축소"
          width={20}
          height={20}
        />
      </ZoomButton>
    </ZoomControls>
  );
}
