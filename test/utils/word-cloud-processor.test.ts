import {
  extractWordFrequencies,
  getTopNWords,
  generateWordCloudData,
} from '@/lib/utils/word-cloud-processor';

describe('word-cloud-processor', () => {
  it('불용어/1글자 토큰을 제거하고 빈도를 계산한다', () => {
    // 불용어(이것)와 1글자 토큰(a, b)은 제외
    const texts = ['이것 테스트 테스트 a b cd', '테스트! cd?'];

    const result = extractWordFrequencies(texts);

    expect(result.get('테스트')).toBe(3);
    expect(result.get('cd')).toBe(2);
    expect(result.has('이것')).toBe(false);
  });

  it('빈도 내림차순으로 상위 N개만 반환한다', () => {
    // 내림차순 정렬 및 topN 제한 확인
    const frequencies = new Map([
      ['alpha', 3],
      ['beta', 2],
      ['gamma', 1],
    ]);

    const result = getTopNWords(frequencies, 2);

    expect(result).toEqual([
      { word: 'alpha', count: 3 },
      { word: 'beta', count: 2 },
    ]);
  });

  it('ideas/comments/memo를 합쳐 워드클라우드 데이터를 만든다', () => {
    // 여러 소스의 텍스트를 모두 합산하는지 확인
    const result = generateWordCloudData({
      ideas: [{ content: '아이디어 좋은' }],
      comments: [{ content: '좋은 의견' }],
      memo: '의견 정리',
    });

    const frequencyMap = new Map(result.map(({ word, count }) => [word, count]));

    expect(frequencyMap.get('좋은')).toBe(2);
    expect(frequencyMap.get('의견')).toBe(2);
    expect(frequencyMap.get('아이디어')).toBe(1);
    expect(frequencyMap.get('정리')).toBe(1);
  });
});
