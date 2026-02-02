/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAIStructuringMutation } from '@/hooks';
import * as issueApi from '@/lib/api/issue';
import { act, renderHook, waitFor } from '../../utils/test-utils';

// 1. 외부 의존성 모킹
jest.mock('@/lib/api/issue');
jest.mock('react-hot-toast');

// 2. React Query 모킹
jest.mock('@tanstack/react-query', () => {
  const original = jest.requireActual('@tanstack/react-query');
  return {
    ...original,
    useQueryClient: jest.fn(),
  };
});

describe('useAIStructuringMutation', () => {
  const issueId = 'issue-123';

  // Mock 함수들
  const mockCategorizeIdeas = issueApi.categorizeIdeas as jest.Mock;
  const mockToastError = toast.error as jest.Mock;

  // QueryClient Spy
  const mockGetQueryData = jest.fn();
  const mockInvalidateQueries = jest.fn();

  // Console Spy (에러 로그 확인용)
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    (useQueryClient as jest.Mock).mockReturnValue({
      getQueryData: mockGetQueryData,
      invalidateQueries: mockInvalidateQueries,
    });

    // console.error를 감시하고, 실제 터미널에는 에러가 안 뜨게 막음
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // 테스트 끝나면 원래대로 복구
    consoleErrorSpy.mockRestore();
  });

  describe('handleAIStructure (AI 구조화 실행)', () => {
    test('아이디어 목록이 아예 비어있으면(0개) 토스트 에러를 띄운다', () => {
      // Given: 빈 배열
      mockGetQueryData.mockReturnValue([]);

      const { result } = renderHook(() => useAIStructuringMutation(issueId));

      // When
      act(() => {
        result.current.handleAIStructure();
      });

      // Then
      expect(mockToastError).toHaveBeenCalledWith('분류할 아이디어가 없습니다.');
      expect(mockCategorizeIdeas).not.toHaveBeenCalled();
    });

    // 필터링 로직 검증
    test('아이디어가 있어도 내용이 공백(" ")뿐이면 토스트 에러를 띄운다', () => {
      // Given: 공백만 있는 아이디어들
      mockGetQueryData.mockReturnValue([
        { id: '1', content: '   ' },
        { id: '2', content: '' },
      ]);

      const { result } = renderHook(() => useAIStructuringMutation(issueId));

      // When
      act(() => {
        result.current.handleAIStructure();
      });

      // Then
      expect(mockToastError).toHaveBeenCalledWith('분류할 아이디어가 없습니다.');
      expect(mockCategorizeIdeas).not.toHaveBeenCalled();
    });

    test('유효한 아이디어가 존재하면 API를 호출하고 성공 시 쿼리를 무효화해야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue([{ id: '1', content: '현실적인 아이디어 1' }]);
      mockCategorizeIdeas.mockResolvedValue({});

      const { result } = renderHook(() => useAIStructuringMutation(issueId));

      // When
      act(() => {
        result.current.handleAIStructure();
      });

      // Then
      await waitFor(() => {
        expect(mockCategorizeIdeas).toHaveBeenCalledWith(issueId);
      });

      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
          queryKey: ['issues', issueId, 'categories'],
        });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
          queryKey: ['issues', issueId, 'ideas'],
        });
      });
    });

    test('API 호출 실패 시 콘솔 에러가 발생해야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue([{ id: '1', content: 'Idea' }]);
      const error = new Error('AI API Error');
      mockCategorizeIdeas.mockRejectedValue(error);

      const { result } = renderHook(() => useAIStructuringMutation(issueId));

      // When
      act(() => {
        result.current.handleAIStructure();
      });

      // Then
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('AI 구조화 오류:', error);
      });

      // 실패했으므로 무효화는 호출되지 않아야 함
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    test('캐시된 데이터가 없는 경우(undefined) 빈 배열로 처리되어 토스트 에러를 띄운다', () => {
      // Given: 캐시가 없어서 undefined 반환 (Branch: cachedData || [])
      mockGetQueryData.mockReturnValue(undefined);

      const { result } = renderHook(() => useAIStructuringMutation(issueId));

      // When
      act(() => {
        result.current.handleAIStructure();
      });

      // Then: ideas가 []가 되고 -> validIdeas도 []가 됨 -> 에러 토스트 발생
      expect(mockToastError).toHaveBeenCalledWith('분류할 아이디어가 없습니다.');
      expect(mockCategorizeIdeas).not.toHaveBeenCalled();
    });
  });
});
