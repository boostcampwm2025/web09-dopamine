import { getCommentMeta } from '@/lib/utils/comment';
import { formatRelativeTime } from '@/lib/utils/time';

jest.mock('@/lib/utils/time', () => ({
  formatRelativeTime: jest.fn(),
}));

describe('getCommentMeta', () => {
  const mockedFormatRelativeTime = formatRelativeTime as jest.MockedFunction<
    typeof formatRelativeTime
  >;

  beforeEach(() => {
    // 시간 포맷 결과를 고정해 테스트 안정화
    mockedFormatRelativeTime.mockReturnValue('1분 전');
  });

  it('nickname이 있으면 nickname을 우선 사용한다', () => {
    // nickname이 name보다 우선인지 확인
    const result = getCommentMeta({
      createdAt: new Date(),
      user: { nickname: '닉네임', name: '기본 이름' },
    } as any);

    expect(result).toBe('닉네임 · 1분 전');
  });

  it('displayName이 없으면 name을 사용한다', () => {
    // displayName이 없을 때 name을 사용하는지 확인
    const result = getCommentMeta({
      createdAt: new Date(),
      user: { name: '기본 이름' },
    } as any);

    expect(result).toBe('기본 이름 · 1분 전');
  });

  it("작성자 정보가 없으면 '익명'을 사용한다", () => {
    // user가 없을 때 익명 처리
    const result = getCommentMeta({
      createdAt: new Date(),
      user: undefined,
    } as any);

    expect(result).toBe('익명 · 1분 전');
  });
});
