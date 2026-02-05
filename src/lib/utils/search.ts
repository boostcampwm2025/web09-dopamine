import { getChoseong } from 'es-hangul';

/**
 * 일반 문자열 및 초성 검색 매칭 여부를 확인하는 유틸리티
 * @param text 검색 대상 텍스트
 * @param normalizedTerm 소문자로 변환된 검색어
 * @param searchChoseong 검색어의 초성
 */
export const matchSearch = (text: string, normalizedTerm: string, searchChoseong: string) => {
  if (text.toLowerCase().includes(normalizedTerm)) return true;
  if (!searchChoseong) return false;
  return getChoseong(text).includes(searchChoseong);
};
