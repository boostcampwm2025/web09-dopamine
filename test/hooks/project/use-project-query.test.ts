/**
 * @jest-environment jsdom
 */
import { useProjectQuery, useProjectsQuery } from '@/hooks';
// 실제 export 경로에 맞게 수정
import * as projectApi from '@/lib/api/project';
import { renderHook, waitFor } from '../../utils/ui-test-helpers';

// 1. API 모듈 모킹
jest.mock('@/lib/api/project');

describe('Project Queries', () => {
  const mockGetProjects = projectApi.getProjects as jest.Mock;
  const mockGetProject = projectApi.getProject as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useProjectsQuery (목록 조회)', () => {
    test('성공 시 프로젝트 목록 데이터를 반환해야 한다', async () => {
      // Given
      const mockData = [
        { id: '1', title: 'Project A' },
        { id: '2', title: 'Project B' },
      ];
      mockGetProjects.mockResolvedValue(mockData);

      // When
      const { result } = renderHook(() => useProjectsQuery());

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(mockGetProjects).toHaveBeenCalledTimes(1);
    });

    test('enabled가 false인 경우 API를 호출하지 않아야 한다', () => {
      // Given
      mockGetProjects.mockResolvedValue([]);

      // When: enabled 옵션을 false로 전달
      const { result } = renderHook(() => useProjectsQuery(false));

      // Then
      // 데이터가 로드되지 않았으므로 isLoading은 true(혹은 fetchStatus가 idle) 상태로 유지됨
      // 핵심은 API가 호출되지 않았다는 것
      expect(mockGetProjects).not.toHaveBeenCalled();
    });
  });

  describe('useProjectQuery (상세 조회)', () => {
    const projectId = 'proj-123';

    test('유효한 ID가 주어지면 상세 데이터를 반환해야 한다', async () => {
      // Given
      const mockData = { id: projectId, title: 'Detail Project' };
      mockGetProject.mockResolvedValue(mockData);

      // When
      const { result } = renderHook(() => useProjectQuery(projectId));

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(mockGetProject).toHaveBeenCalledWith(projectId);
    });

    test('ID가 없는 경우(빈 문자열) API를 호출하지 않아야 한다', () => {
      // Given
      // When: 빈 문자열 전달
      const { result } = renderHook(() => useProjectQuery(''));

      // Then
      // useQuery의 enabled: !!projectId 조건 때문에 호출되면 안 됨
      expect(mockGetProject).not.toHaveBeenCalled();

      // 데이터는 undefined여야 함
      expect(result.current.data).toBeUndefined();
    });
  });
});
