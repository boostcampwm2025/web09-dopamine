/**
 * @jest-environment jsdom
 */
import { useCategoryQuery } from '@/hooks';
import * as categoryApi from '@/lib/api/category';
import { renderHook, waitFor } from '../../utils/ui-test-helpers';

// 1. API 모킹
jest.mock('@/lib/api/category');

describe('useCategoryQuery', () => {
  const issueId = 'issue-123';
  const mockFetchCategories = categoryApi.fetchCategories as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('데이터를 가져와서 UI 형식에 맞게 변환해야 한다 (Transformation)', async () => {
    // Given: 서버에서 오는 원본 데이터 (DB 형태)
    const mockDbCategories = [
      {
        id: 'cat-1',
        title: 'Normal Category',
        positionX: 50,
        positionY: 200,
        // 기타 DB 필드들...
      },
      {
        id: 'cat-2',
        title: 'No Position Category',
        positionX: null, // 위치 정보 없음
        positionY: null,
      },
    ];

    mockFetchCategories.mockResolvedValue(mockDbCategories);

    // When
    const { result } = renderHook(() => useCategoryQuery(issueId));

    // Then
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // API 호출 확인
    expect(mockFetchCategories).toHaveBeenCalledWith(issueId);

    // 데이터 변환 검증 (select 옵션 동작 확인)
    const data = result.current.data;

    expect(data).toHaveLength(2);

    // 1. 정상적인 위치 정보가 있는 경우
    expect(data?.[0]).toEqual({
      id: 'cat-1',
      title: 'Normal Category',
      position: { x: 50, y: 200 }, // 객체로 변환됨
      isMuted: false, // 기본값 추가됨
    });

    // 2. 위치 정보가 null인 경우 (기본값 100 적용 확인)
    expect(data?.[1]).toEqual({
      id: 'cat-2',
      title: 'No Position Category',
      position: { x: 100, y: 100 }, // null -> 100 변환 확인
      isMuted: false,
    });
  });

  test('데이터가 없는 경우 빈 배열을 반환해야 한다', async () => {
    // Given
    mockFetchCategories.mockResolvedValue([]);

    // When
    const { result } = renderHook(() => useCategoryQuery(issueId));

    // Then
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
