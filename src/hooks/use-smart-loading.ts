import { useEffect, useRef, useState } from 'react';

/**
 * 로딩 상태를 스마트하게 관리하는 훅
 * - 로딩이 빠르면(200ms 이하) 스켈레톤을 보여주지 않음
 * - 스켈레톤이 한번 나타나면 최소 400ms 유지 (너무 빨리 사라지는 것 방지)
 */
export function useSmartLoading(
  isLoading: boolean,
  delay: number = 100,
  minDuration: number = 400,
) {
  const [showLoading, setShowLoading] = useState(false);
  const showStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isLoading && !showLoading) {
      // 로딩 시작 - delay 후에 스켈레톤 표시
      const timer = setTimeout(() => {
        setShowLoading(true);
        showStartTimeRef.current = Date.now();
      }, delay);

      return () => clearTimeout(timer);
    }

    if (!isLoading && showLoading) {
      // 로딩 종료 - 최소 표시 시간 유지
      const elapsed = Date.now() - showStartTimeRef.current;
      const remaining = Math.max(0, minDuration - elapsed);

      const timer = setTimeout(() => {
        setShowLoading(false);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [isLoading, showLoading, delay, minDuration]);

  return showLoading;
}
