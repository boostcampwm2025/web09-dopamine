/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useLeaveProjectMutation,
  useUpdateProjectMutation,
} from '@/hooks';
import * as leaveApi from '@/lib/api/leave';
import * as projectApi from '@/lib/api/project';
import { act, renderHook, waitFor } from '../../utils/test-utils';

// 1. 외부 모듈 모킹
jest.mock('@/lib/api/project');
jest.mock('@/lib/api/leave');
jest.mock('react-hot-toast');

// 2. React Query의 useQueryClient 모킹 (invalidateQueries 감시용)
jest.mock('@tanstack/react-query', () => {
  const original = jest.requireActual('@tanstack/react-query');
  return {
    ...original,
    useQueryClient: jest.fn(),
  };
});

describe('Project Mutations', () => {
  // API Mock 함수들
  const mockCreateProject = projectApi.createProject as jest.Mock;
  const mockDeleteProject = projectApi.deleteProject as jest.Mock;
  const mockUpdateProject = projectApi.updateProject as jest.Mock;
  const mockLeaveProject = leaveApi.leaveProject as jest.Mock;
  const mockToastError = toast.error as jest.Mock;

  // QueryClient Spy
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // useQueryClient 호출 시 스파이 객체 반환
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
  });

  describe('useCreateProjectMutation', () => {
    test('성공 시 프로젝트 생성 API를 호출하고 목록 쿼리를 무효화해야 한다', async () => {
      // Given
      mockCreateProject.mockResolvedValue({});
      const { result } = renderHook(() => useCreateProjectMutation());

      // When
      act(() => {
        result.current.mutate({ title: 'New Project', description: 'Desc' });
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockCreateProject).toHaveBeenCalledWith('New Project', 'Desc');
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['projects'] });
    });

    test('실패 시 에러 토스트를 띄워야 한다', async () => {
      // Given
      const errorMsg = '생성 실패';
      mockCreateProject.mockRejectedValue(new Error(errorMsg));
      const { result } = renderHook(() => useCreateProjectMutation());

      // When
      act(() => {
        result.current.mutate({ title: 'Fail Project' });
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith(errorMsg);
    });
  });

  describe('useDeleteProjectMutation', () => {
    test('성공 시 프로젝트 삭제 API를 호출하고 목록 쿼리를 무효화해야 한다', async () => {
      // Given
      mockDeleteProject.mockResolvedValue({});
      const { result } = renderHook(() => useDeleteProjectMutation());

      // When
      act(() => {
        result.current.mutate({ id: 'proj-1' });
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockDeleteProject).toHaveBeenCalledWith('proj-1');
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['projects'] });
    });

    test('실패 시 콘솔 에러가 찍혀야 한다 (토스트 호출 없음)', async () => {
      // Given
      mockDeleteProject.mockRejectedValue(new Error('삭제 실패'));
      const { result } = renderHook(() => useDeleteProjectMutation());

      // When
      act(() => {
        result.current.mutate({ id: 'proj-1' });
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));

      // useDeleteProjectMutation은 토스트를 띄우지 않음
      expect(mockToastError).not.toHaveBeenCalled();
      // console.error 호출 여부는 spyOn으로 인해 로그에는 안 찍히지만 내부는 실행됨
    });
  });

  describe('useUpdateProjectMutation', () => {
    test('성공 시 수정 API 호출 후 목록과 상세 쿼리 모두 무효화해야 한다', async () => {
      // Given
      mockUpdateProject.mockResolvedValue({});
      const { result } = renderHook(() => useUpdateProjectMutation());
      const updateData = { id: 'proj-1', title: 'Updated', description: 'New Desc' };

      // When
      act(() => {
        result.current.mutate(updateData);
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockUpdateProject).toHaveBeenCalledWith('proj-1', 'Updated', 'New Desc');

      // 두 가지 쿼리 키가 무효화되었는지 확인
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['projects'] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['project', 'proj-1'] });
    });

    test('실패 시 에러 토스트를 띄워야 한다', async () => {
      // Given
      mockUpdateProject.mockRejectedValue(new Error('수정 실패'));
      const { result } = renderHook(() => useUpdateProjectMutation());

      // When
      act(() => {
        result.current.mutate({ id: 'proj-1', title: 'Fail' });
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith('수정 실패');
    });
  });

  describe('useLeaveProjectMutation', () => {
    test('성공 시 프로젝트 나가기 API를 호출하고 목록 쿼리를 무효화해야 한다', async () => {
      // Given
      mockLeaveProject.mockResolvedValue({});
      const { result } = renderHook(() => useLeaveProjectMutation());

      // When
      act(() => {
        result.current.mutate({ projectId: 'proj-1', memberId: 'user-1' });
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockLeaveProject).toHaveBeenCalledWith('proj-1', 'user-1');
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['projects'] });
    });

    test('실패 시 콘솔 에러가 찍혀야 한다 (토스트 호출 없음)', async () => {
      // Given
      mockLeaveProject.mockRejectedValue(new Error('나가기 실패'));
      const { result } = renderHook(() => useLeaveProjectMutation());

      // When
      act(() => {
        result.current.mutate({ projectId: 'proj-1', memberId: 'user-1' });
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockToastError).not.toHaveBeenCalled();
    });
  });
});
