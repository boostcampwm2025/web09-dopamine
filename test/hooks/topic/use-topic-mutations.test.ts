/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useTopicMutations } from '@/hooks';
import * as issueMapApi from '@/lib/api/issue-map';
import { act, renderHook, waitFor } from '../../utils/ui-test-helpers';

// 1. API 및 Toast 모킹
jest.mock('@/lib/api/issue-map');
jest.mock('react-hot-toast');

// 2. React Query의 useQueryClient만 부분 모킹 (낙관적 업데이트 검증용)
jest.mock('@tanstack/react-query', () => {
  const original = jest.requireActual('@tanstack/react-query');
  return {
    ...original,
    useQueryClient: jest.fn(),
  };
});

describe('useTopicMutations Hook', () => {
  const topicId = 'topic-123';

  // 모킹된 함수들 타입 지정
  const mockCreateConnection = issueMapApi.createConnection as jest.Mock;
  const mockDeleteConnection = issueMapApi.deleteConnection as jest.Mock;
  const mockUpdateNodePosition = issueMapApi.updateNodePosition as jest.Mock;
  const mockToastError = toast.error as jest.Mock;

  // QueryClient 메서드 스파이
  const mockCancelQueries = jest.fn();
  const mockGetQueryData = jest.fn();
  const mockSetQueryData = jest.fn();
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // useQueryClient가 호출되면 우리가 만든 스파이 객체를 반환하도록 설정
    (useQueryClient as jest.Mock).mockReturnValue({
      cancelQueries: mockCancelQueries,
      getQueryData: mockGetQueryData,
      setQueryData: mockSetQueryData,
      invalidateQueries: mockInvalidateQueries,
    });
  });

  describe('createConnection (연결 생성)', () => {
    test('성공 시 낙관적 업데이트 후 쿼리를 무효화해야 한다', async () => {
      // Given: 이전 연결 데이터 설정
      const previousConnections = [{ id: 'conn-1', sourceIssueId: 'a', targetIssueId: 'b' }];
      mockGetQueryData.mockReturnValue(previousConnections);
      mockCreateConnection.mockResolvedValue({ id: 'new-conn-server' }); // 서버 성공

      const { result } = renderHook(() => useTopicMutations(topicId));

      // When
      await act(async () => {
        result.current.createConnection({
          sourceIssueId: 'issue-1',
          targetIssueId: 'issue-2',
          sourceHandle: null,
          targetHandle: null,
        });
      });

      // Then
      // 1. 기존 쿼리 취소 확인
      expect(mockCancelQueries).toHaveBeenCalledWith({
        queryKey: ['topics', topicId, 'connections'],
      });

      // 2. 낙관적 업데이트 확인 (새로운 데이터가 즉시 추가되었는지)
      expect(mockSetQueryData).toHaveBeenCalledWith(
        ['topics', topicId, 'connections'],
        expect.arrayContaining([
          ...previousConnections,
          expect.objectContaining({
            id: expect.stringMatching(/^temp-/), // 임시 ID 확인
            sourceIssueId: 'issue-1',
          }),
        ]),
      );

      // 3. API 호출 후 무효화 확인
      expect(mockCreateConnection).toHaveBeenCalled();
      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
          queryKey: ['topics', topicId, 'connections'],
        });
      });
    });

    test('실패 시 이전 데이터로 롤백(Rollback)해야 한다', async () => {
      // Given
      const previousConnections = [{ id: 'conn-1' }];
      mockGetQueryData.mockReturnValue(previousConnections);
      mockCreateConnection.mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => useTopicMutations(topicId));

      // When
      await act(async () => {
        result.current.createConnection({
          sourceIssueId: '1',
          targetIssueId: '2',
          sourceHandle: null,
          targetHandle: null,
        });
      });

      // Then: 에러 발생 대기
      await waitFor(() => expect(mockToastError).toHaveBeenCalled());

      // 롤백 확인: setQueryData가 이전 데이터(previousConnections)로 다시 호출되었는지
      // (첫 번째 호출은 낙관적 업데이트, 두 번째 호출이 롤백이어야 함)
      expect(mockSetQueryData).toHaveBeenLastCalledWith(
        ['topics', topicId, 'connections'],
        previousConnections, // 롤백된 데이터
      );
    });
  });

  describe('deleteConnection (연결 삭제)', () => {
    test('성공 시 낙관적 업데이트로 즉시 삭제되어야 한다', async () => {
      // Given: 삭제할 'conn-2'가 포함된 데이터
      const previousConnections = [
        { id: 'conn-1' },
        { id: 'conn-2' }, // 삭제 대상
      ];
      mockGetQueryData.mockReturnValue(previousConnections);
      mockDeleteConnection.mockResolvedValue({});

      const { result } = renderHook(() => useTopicMutations(topicId));

      // When
      await act(async () => {
        result.current.deleteConnection('conn-2');
      });

      // Then
      expect(mockCancelQueries).toHaveBeenCalled();

      // 낙관적 업데이트: conn-2가 제거된 배열로 setQueryData 호출
      expect(mockSetQueryData).toHaveBeenCalledWith(
        ['topics', topicId, 'connections'],
        [{ id: 'conn-1' }],
      );

      await waitFor(() => expect(mockInvalidateQueries).toHaveBeenCalled());
    });
  });

  describe('updateNodePosition (노드 이동)', () => {
    test('성공 시 낙관적 업데이트로 즉시 위치가 변경되어야 한다', async () => {
      // Given: 초기 노드 데이터
      const previousNodes = [
        { id: 'node-1', positionX: 0, positionY: 0 },
        { id: 'node-2', positionX: 10, positionY: 10 },
      ];
      mockGetQueryData.mockReturnValue(previousNodes);
      mockUpdateNodePosition.mockResolvedValue({});

      const { result } = renderHook(() => useTopicMutations(topicId));

      // When: node-1을 (100, 100)으로 이동
      await act(async () => {
        result.current.updateNodePosition({ nodeId: 'node-1', positionX: 100, positionY: 100 });
      });

      // Then
      expect(mockCancelQueries).toHaveBeenCalledWith({ queryKey: ['topics', topicId, 'nodes'] });

      // 낙관적 업데이트 확인: node-1의 좌표가 바뀐 상태로 저장되었는지
      expect(mockSetQueryData).toHaveBeenCalledWith(
        ['topics', topicId, 'nodes'],
        [
          expect.objectContaining({ id: 'node-1', positionX: 100, positionY: 100 }), // 변경됨
          expect.objectContaining({ id: 'node-2', positionX: 10, positionY: 10 }), // 그대로
        ],
      );
    });

    test('실패 시 원래 위치로 롤백되어야 한다', async () => {
      // Given
      const previousNodes = [{ id: 'node-1', positionX: 0, positionY: 0 }];
      mockGetQueryData.mockReturnValue(previousNodes);
      mockUpdateNodePosition.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useTopicMutations(topicId));

      // When
      await act(async () => {
        result.current.updateNodePosition({ nodeId: 'node-1', positionX: 999, positionY: 999 });
      });

      // Then
      await waitFor(() => expect(mockToastError).toHaveBeenCalled());

      // 롤백 확인: 원래 좌표(0,0)인 previousNodes로 다시 덮어씌웠는지 확인
      expect(mockSetQueryData).toHaveBeenLastCalledWith(
        ['topics', topicId, 'nodes'],
        previousNodes,
      );
    });
  });
});
