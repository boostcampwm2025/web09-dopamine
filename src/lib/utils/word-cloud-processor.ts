/**
 * 워드클라우드 생성을 위한 텍스트 전처리 및 단어 카운팅 유틸리티
 */

// 한국어 불용어 목록 (추가 가능)
const STOP_WORDS = new Set([
  '이',
  '가',
  '을',
  '를',
  '의',
  '에',
  '에서',
  '로',
  '으로',
  '와',
  '과',
  '도',
  '만',
  '부터',
  '까지',
  '은',
  '는',
  '이다',
  '있다',
  '없다',
  '하다',
  '되다',
  '그',
  '그것',
  '이것',
  '저것',
  '그런',
  '이런',
  '저런',
  '그렇게',
  '이렇게',
  '저렇게',
  '그리고',
  '또한',
  '또',
  '또는',
  '하지만',
  '그러나',
  '그런데',
  '그래서',
  '따라서',
  '그러면',
  '만약',
  '만약에',
  '만일',
  '때문에',
  '위해서',
  '대해서',
  '관해서',
  '통해서',
  '의해서',
  '로서',
  '로써',
  '처럼',
  '같이',
  '만큼',
  '보다',
  '부터',
  '까지',
  '조차',
  '마저',
  '마저도',
  '조차도',
  '마저도',
  '조차도',
  '조차도',
  '마저도',
  '조차도',
  '마저도',
  '조차도',
  '것',
  '거',
  '게',
  '건',
  '걸',
  '껀',
  '껄',
  '거기',
  '그곳',
  '여기',
  '이곳',
  '저기',
  '저곳',
  '누구',
  '누가',
  '무엇',
  '뭐',
  '어디',
  '언제',
  '어떻게',
  '왜',
  '어째서',
  '어찌',
  '어찌하여',
  '아',
  '어',
  '오',
  '우',
  '으',
  '이',
  '야',
  '여',
  '요',
  '네',
  '예',
  '응',
  '그래',
  '맞아',
  '안',
  '않',
  '못',
  '못하',
  '못해',
  '못했',
  '못할',
  '못할까',
  '못할지',
  '못할지도',
  '수',
  '있',
  '없',
  '하',
  '되',
  '되게',
  '되도록',
  '되게끔',
  '되도록이면',
]);

// 최소 단어 길이
const MIN_WORD_LENGTH = 2;

/**
 * 텍스트를 정규화합니다 (소문자 변환, 특수문자 제거 등)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ') // 한글, 영문, 숫자만 남기고 나머지는 공백으로
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
    .trim();
}

/**
 * 텍스트를 단어로 분리합니다
 */
function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  // 한글과 영문을 분리하여 토큰화
  const tokens: string[] = [];

  // 한글 단어 추출 (2글자 이상)
  const koreanWords = normalized.match(/[가-힣]{2,}/g) || [];
  tokens.push(...koreanWords);

  // 영문 단어 추출 (2글자 이상)
  const englishWords = normalized.match(/[a-z]{2,}/g) || [];
  tokens.push(...englishWords);

  return tokens;
}

/**
 * 불용어를 제거하고 최소 길이 이상의 단어만 반환합니다
 */
function filterWords(words: string[]): string[] {
  return words.filter((word) => word.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(word));
}

/**
 * 단어 빈도를 계산합니다
 */
function countWords(words: string[]): Map<string, number> {
  const wordCount = new Map<string, number>();

  for (const word of words) {
    const count = wordCount.get(word) || 0;
    wordCount.set(word, count + 1);
  }

  return wordCount;
}

/**
 * 텍스트 배열에서 단어를 추출하고 빈도를 계산합니다
 */
export function extractWordFrequencies(texts: string[]): Map<string, number> {
  const allWords: string[] = [];

  // 모든 텍스트를 합쳐서 처리
  for (const text of texts) {
    if (!text || text.trim().length === 0) continue;

    const tokens = tokenize(text);
    const filtered = filterWords(tokens);
    allWords.push(...filtered);
  }

  return countWords(allWords);
}

/**
 * 단어 빈도 맵에서 상위 N개를 추출합니다
 */
export function getTopNWords(
  wordFrequencies: Map<string, number>,
  topN: number = 50,
): Array<{ word: string; count: number }> {
  const sorted = Array.from(wordFrequencies.entries())
    .sort((a, b) => b[1] - a[1]) // 빈도 내림차순
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));

  return sorted;
}

/**
 * ideas, comments, memo에서 텍스트를 추출하여 워드클라우드 데이터를 생성합니다
 */
export interface WordCloudSource {
  ideas: Array<{ content: string }>;
  comments: Array<{ content: string }>;
  memo: string | null;
}

export function generateWordCloudData(
  source: WordCloudSource,
  topN: number = 50,
): Array<{ word: string; count: number }> {
  const texts: string[] = [];

  // ideas의 content 추가
  for (const idea of source.ideas) {
    if (idea.content) {
      texts.push(idea.content);
    }
  }

  // comments의 content 추가
  for (const comment of source.comments) {
    if (comment.content) {
      texts.push(comment.content);
    }
  }

  // memo 추가
  if (source.memo) {
    texts.push(source.memo);
  }

  // 단어 빈도 계산
  const wordFrequencies = extractWordFrequencies(texts);

  // 상위 N개 추출
  return getTopNWords(wordFrequencies, topN);
}
