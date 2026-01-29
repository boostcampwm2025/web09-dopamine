/**
 * 기존 카테고리 이름들과 겹치지 않는 새로운 카테고리 이름을 생성합니다.
 * @param existingTitles 현재 존재하는 카테고리 제목 배열
 * @param baseTitle 기본이 될 제목 (기본값: '새 카테고리')
 * @returns 중복되지 않는 새로운 제목 (예: '새 카테고리', '새 카테고리 1', '새 카테고리 2' ...)
 */
export function generateUniqueCategoryName(existingTitles: string[], baseTitle: string = '새 카테고리'): string {
  // 기본 제목이 존재하지 않으면 바로 반환
  if (!existingTitles.includes(baseTitle)) {
    return baseTitle;
  }

  // 기본 제목으로 시작하고 뒤에 숫자가 붙은 제목들에서 숫자만 추출
  const existingNumbers = existingTitles
    .filter((title) => title.startsWith(baseTitle))
    .map((title) => {
      if (title === baseTitle) return 0;
      const suffix = title.replace(baseTitle, '').trim();
      const num = parseInt(suffix);
      return isNaN(num) ? -1 : num;
    })
    .filter((num) => num >= 0);

  // 가장 큰 숫자 + 1을 다음 숫자로 결정
  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

  return `${baseTitle} ${nextNumber}`;
}
