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

  beforeEach(() => {
    jest.clearAllMocks();

    (useQueryClient as jest.Mock).mockReturnValue({
      getQueryData: mockGetQueryData,
      invalidateQueries: mockInvalidateQueries,
    });
  });

  describe('handleAIStructure (AI 구조화 실행)', () => {
    test('아이디어 목록이 비어있으면(0개) 토스트 에러를 띄우고 API를 호출하지 않아야 한다', () => {
      // Given: 빈 배열
      mockGetQueryData.mockReturnValue([]);

      const { result } = renderHook(() => useAIStructuringMutation(issueId));

      // When
      act(() => {
        result.current.handleAIStructure();
      });

      // Then: 여기는 동기적으로 처리되므로 waitFor 없어도 됨 (mutate 호출 전 return 되니까)
      expect(mockToastError).toHaveBeenCalledWith('분류할 아이디어가 없습니다.');
      expect(mockCategorizeIdeas).not.toHaveBeenCalled();
    });

    test('아이디어가 존재하면 API를 호출하고 성공 시 쿼리를 무효화해야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue([
        { id: '1', content: '현실적인 아이디어 1' },
        { id: '2', content: '현실적인 아이디어 2' },
      ]);
      mockCategorizeIdeas.mockResolvedValue({});

      const { result } = renderHook(() => useAIStructuringMutation(issueId));

      // When
      act(() => {
        result.current.handleAIStructure();
      });

      // Then
      // API 호출 자체가 비동기이므로 호출될 때까지 기다려야 함
      await waitFor(() => {
        expect(mockCategorizeIdeas).toHaveBeenCalledWith(issueId);
      });

      // 쿼리 무효화 확인
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
      mockCategorizeIdeas.mockRejectedValue(new Error('AI API Error'));

      const { result } = renderHook(() => useAIStructuringMutation(issueId));

      // When
      act(() => {
        result.current.handleAIStructure();
      });

      // Then
      // 실패 케이스도 API 호출 확인을 기다려야 함
      await waitFor(() => {
        expect(mockCategorizeIdeas).toHaveBeenCalled();
      });

      // 실패했으므로 무효화는 일어나지 않음 (충분히 기다린 후 확인)
      // waitFor 안에서 not.toHaveBeenCalled를 쓰면 "영원히 안 불리는지" 확인하느라 타임아웃 날 수 있음
      // 따라서 API 호출 확인 후 조금 기다렸다가 체크
      await new Promise((r) => setTimeout(r, 100));
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
  });
});
