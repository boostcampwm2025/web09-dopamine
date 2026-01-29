// 익명 이슈 사용자 ID 로컬스토리지 유틸 단위 테스트
// 테스트 대상 함수
import { getUserIdForIssue, setUserIdForIssue } from '@/lib/storage/issue-user-storage';

describe('issue-user-storage', () => {
  // 로컬스토리지 목 객체 생성 함수
  const createLocalStorageMock = () => {
    // in-memory 저장소
    let store: Record<string, string> = {};

    return {
      // 키로 조회
      getItem: jest.fn((key: string) => store[key] ?? null),
      // 키로 저장
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      // 전체 초기화
      clear: jest.fn(() => {
        store = {};
      }),
    };
  };

  beforeEach(() => {
    // 각 테스트마다 새로운 localStorage 주입
    const localStorageMock = createLocalStorageMock();
    (globalThis as any).window = { localStorage: localStorageMock };
    (globalThis as any).localStorage = localStorageMock;
  });

  afterEach(() => {
    // 전역 오염 방지
    delete (globalThis as any).window;
    delete (globalThis as any).localStorage;
  });

  it('저장된 값이 없으면 undefined를 반환한다', () => {
    // 저장 전 조회
    const result = getUserIdForIssue('issue-1');
    // undefined 반환 확인
    expect(result).toBeUndefined();
  });

  it('setUserIdForIssue 이후 getUserIdForIssue로 조회된다', () => {
    // 사용자 ID 저장
    setUserIdForIssue('issue-1', 'user-1');

    // 저장 후 조회
    const result = getUserIdForIssue('issue-1');

    // 저장된 값이 조회되는지 확인
    expect(result).toBe('user-1');
  });

  it('손상된 JSON이 있어도 에러 없이 처리된다', () => {
    // 에러 로그를 감시하기 위한 spy
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // 잘못된 JSON을 반환하도록 조작
    (globalThis as any).window.localStorage.getItem = jest
      .fn()
      .mockReturnValue('not-json');

    // 조회 시도
    const result = getUserIdForIssue('issue-1');

    // 실패 시 undefined 반환 확인
    expect(result).toBeUndefined();
    // 에러 로그가 호출되었는지 확인
    expect(consoleSpy).toHaveBeenCalled();

    // spy 복구
    consoleSpy.mockRestore();
  });
});
