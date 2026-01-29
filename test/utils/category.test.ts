import { generateUniqueCategoryName } from '@/lib/utils/category';

describe('generateUniqueCategoryName', () => {
  const baseTitle = '새 카테고리';

  it('기존 타이틀이 없으면 기본 타이틀을 반환한다', () => {
    expect(generateUniqueCategoryName([])).toBe(baseTitle);
  });

  it('기존 타이틀에 기본 타이틀이 없으면 기본 타이틀을 반환한다', () => {
    expect(generateUniqueCategoryName(['다른 카테고리', '테스트'])).toBe(baseTitle);
  });

  it('기본 타이틀이 이미 존재하면 "기본 타이틀 1"을 반환한다', () => {
    expect(generateUniqueCategoryName([baseTitle])).toBe(`${baseTitle} 1`);
  });

  it('기본 타이틀과 "기본 타이틀 1"이 존재하면 "기본 타이틀 2"를 반환한다', () => {
    expect(generateUniqueCategoryName([baseTitle, `${baseTitle} 1`])).toBe(`${baseTitle} 2`);
  });

  it('중간 번호가 비어있어도 최대값 + 1을 반환한다', () => {
    expect(generateUniqueCategoryName([baseTitle, `${baseTitle} 5`])).toBe(`${baseTitle} 6`);
  });

  it('숫자가 아닌 접미사가 붙은 경우는 무시하고 생성한다', () => {
    expect(generateUniqueCategoryName([baseTitle, `${baseTitle} abc`])).toBe(`${baseTitle} 1`);
  });

  it('커스텀 베이스 타이틀을 사용할 수 있다', () => {
    const customBase = 'Task';
    expect(generateUniqueCategoryName(['Task', 'Task 1'], customBase)).toBe('Task 2');
  });
});
