'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { getWordClouds } from '@/lib/api/report';
import * as PS from '../../page.styles';
import * as S from './word-cloud.styles';

export default function WordCloudSection() {
  const params = useParams<{ id: string }>();
  const issueId = params.id || '';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [words, setWords] = useState<[string, number][]>([]);

  useEffect(() => {
    const fetchWordClouds = async () => {
      setIsLoading(true);
      try {
        const data = await getWordClouds(issueId);
        const formatted: [string, number][] = data.map((item) => [item.word, item.count]);

        setWords(formatted);
      } catch (e) {
        console.error('워드클라우드 로드 실패:', e);
      } finally {
        setIsLoading(false);
      }
    };

    if (issueId) fetchWordClouds();
  }, [issueId]);

  // useEffect(() => {
  //   if (!canvasRef.current || words.length === 0) return;

  //   const canvas = canvasRef.current;
  //   const width = canvas.offsetWidth;

  //   WordCloud(canvas, {
  //     list: words,
  //     gridSize: Math.round((16 * width) / 1024),
  //     weightFactor: (size: number) => Math.pow(size, 2.3) * 18,
  //     fontFamily: 'Pretendard, sans-serif',
  //     fontWeight: '600',
  //     color: 'oklch(0.62 0.18 145)',
  //     rotateRatio: 0.2,
  //     rotationSteps: 2,
  //     backgroundColor: 'oklch(0.98 0.01 145)',
  //     shuffle: true,
  //     drawOutOfBound: false,
  //   });
  // }, [words]);

  useEffect(() => {
    if (!canvasRef.current || words.length === 0) return;

    import('wordcloud').then((WordCloudModule) => {
      const WordCloud = WordCloudModule.default;

      if (!canvasRef.current || words.length === 0) return;

      const canvas = canvasRef.current;
      const width = canvas.parentElement!.offsetWidth;

      const max = Math.max(...words.map(([, w]) => w));
      const min = Math.min(...words.map(([, w]) => w));

      WordCloud(canvasRef.current!, {
        list: words,
        gridSize: Math.round((16 * width) / 1024),
        weightFactor: (weight: number) => {
          const normalized = (weight - min) / (max - min || 1);
          return 30 + normalized * 40;
        },
        fontFamily: 'Pretendard, sans-serif',
        fontWeight: '600',
        color: (_word: string, weight: number) =>
          weight === max ? 'oklch(0.55 0.19 145)' : 'oklch(0.78 0.04 145)',
        backgroundColor: 'oklch(0.97 0.015 145)',
        rotateRatio: 0.25,
        rotationSteps: 2,
        shuffle: true,
      });
    });
  }, [words]);

  return (
    <S.Container>
      <PS.HeaderTitle>워드 클라우드</PS.HeaderTitle>

      <S.WordCloudBox>
        {isLoading ? (
          <S.LoadingText>워드클라우드 로딩 중...</S.LoadingText>
        ) : words.length === 0 ? (
          <S.EmptyText>워드클라우드 데이터가 없습니다.</S.EmptyText>
        ) : (
          <canvas
            ref={canvasRef}
            width={800}
            height={300}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        )}
      </S.WordCloudBox>
    </S.Container>
  );
}
