'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { getWordClouds } from '@/lib/api/report';
import { theme } from '@/styles/theme';
import * as PS from '../../page.styles';
import * as S from './word-cloud.styles';

const WORD_CLOUD_GREEN_PALETTE = [
  theme.colors.wordcloud[100],
  theme.colors.wordcloud[200],
  theme.colors.wordcloud[300],
  theme.colors.wordcloud[400],
  theme.colors.wordcloud[500],
  theme.colors.wordcloud[600],
];

// 단어 문자열로 결정론적 0~1 값 생성 (같은 단어는 항상 같은 값)
function wordToVariation(word: string): number {
  let h = 0;
  for (let i = 0; i < word.length; i++) h = (h * 31 + word.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
}

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

    import('wordcloud').then((WordCloudModule) => {
      const WordCloud = WordCloudModule.default;

      if (!canvasRef.current || words.length === 0) return;

      const canvas = canvasRef.current;
      const width = canvas.parentElement!.offsetWidth;

      // 같은 빈도여도 단어마다 0~0.4 미세 변동을 넣어 글자 크기 단계를 다양하게 함
      const variationScale = 0.6;
      const listWithVariation: [string, number][] = words.map(([word, count]) => [
        word,
        count + wordToVariation(word) * variationScale,
      ]);

      const max = Math.max(...listWithVariation.map(([, w]) => w));
      const min = Math.min(...listWithVariation.map(([, w]) => w));
      const range = max - min || 1;

      const minFontSize = 14;
      const maxFontSize = 72;
      const sizeRange = maxFontSize - minFontSize;

      WordCloud(canvasRef.current!, {
        list: listWithVariation,
        gridSize: Math.round((16 * width) / 1024),
        weightFactor: (weight: number) => {
          const normalized = (weight - min) / range;
          return minFontSize + normalized * sizeRange;
        },
        fontFamily: 'Pretendard, sans-serif',
        fontWeight: '600',
        color: (_word: string, weight: number) => {
          const normalized = (weight - min) / range;
          const index = Math.min(
            Math.floor(normalized * WORD_CLOUD_GREEN_PALETTE.length),
            WORD_CLOUD_GREEN_PALETTE.length - 1,
          );
          return WORD_CLOUD_GREEN_PALETTE[index];
        },
        backgroundColor: theme.colors.gray[50],
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
