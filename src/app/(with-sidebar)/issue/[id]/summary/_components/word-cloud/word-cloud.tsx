'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import WordCloud from 'wordcloud';
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

  useEffect(() => {
    if (!canvasRef.current || words.length === 0) return;

    WordCloud(canvasRef.current, {
      list: words,
      gridSize: 8,
      weightFactor: 12,
      fontFamily: 'Pretendard, sans-serif',
      color: 'random-dark',
      backgroundColor: '#f5f5f5',
      rotateRatio: 0.2,
      rotationSteps: 2,
      shuffle: true,
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
            width={600}
            height={240}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </S.WordCloudBox>
    </S.Container>
  );
}
