/**
 * @jest-environment jsdom
 */
import { signOut } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useUserMutation } from '@/hooks/user/use-user-mutation';
import { updateDisplayName, withdraw } from '@/lib/api/auth';
import { act, renderHook, waitFor } from '../../utils/test-utils';

// 1. 외부 의존성 모킹 (API, Toast, NextAuth)
jest.mock('@/lib/api/auth');
jest.mock('react-hot-toast');
jest.mock('next-auth/react');

// 2. React Query의 useQueryClient만 부분 모킹 (clear 감시용)
// useMutation은 실제 로직을 써야 하므로 requireActual로 가져옵니다.
jest.mock('@tanstack/react-query', () => {
  const original = jest.requireActual('@tanstack/react-query');
  return {
    ...original,
    useQueryClient: jest.fn(),
  };
});

describe('useUserMutation', () => {
  // Mock 함수 타입 캐스팅
  const mockWithdraw = withdraw as jest.Mock;
  const mockUpdateDisplayName = updateDisplayName as jest.Mock;
  const mockSignOut = signOut as jest.Mock;
  const mockToastSuccess = toast.success as jest.Mock;
  const mockToastError = toast.error as jest.Mock;

  // queryClient.clear() 호출을 감시할 스파이 함수
  const mockClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // console.error 노이즈 제거
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // useQueryClient가 호출되면 우리가 만든 스파이 함수(mockClear)를 가진 객체를 반환하도록 설정
    (useQueryClient as jest.Mock).mockReturnValue({
      clear: mockClear,
    });
  });

  describe('withdrawMutation (회원탈퇴)', () => {
    test('회원탈퇴 성공 시 토스트를 띄우고 캐시를 초기화하며 로그아웃해야 한다', async () => {
      // Given: API 성공 가정
      mockWithdraw.mockResolvedValue(undefined);

      const { result } = renderHook(() => useUserMutation());

      // When: 뮤테이션 실행
      act(() => {
        result.current.withdrawMutation.mutate();
      });

      // Then: 성공 상태 대기
      await waitFor(() => expect(result.current.withdrawMutation.isSuccess).toBe(true));

      // 1. API 호출 확인
      expect(mockWithdraw).toHaveBeenCalled();

      // 2. 토스트 메시지 확인
      expect(mockToastSuccess).toHaveBeenCalledWith('회원탈퇴가 완료되었습니다.');

      // 3. 쿼리 캐시 초기화(clear) 호출 확인
      expect(mockClear).toHaveBeenCalled();

      // 4. 로그아웃 호출 확인
      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' });
    });

    test('회원탈퇴 실패 시 에러 토스트를 띄워야 한다', async () => {
      // Given: API 실패 가정
      const errorMessage = '탈퇴 처리 중 오류 발생';
      mockWithdraw.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useUserMutation());

      // When
      act(() => {
        result.current.withdrawMutation.mutate();
      });

      // Then: 에러 상태 대기
      await waitFor(() => expect(result.current.withdrawMutation.isError).toBe(true));

      // 1. 에러 토스트 확인
      expect(mockToastError).toHaveBeenCalledWith(errorMessage);

      // 2. 실패 시에는 로그아웃이나 캐시 초기화가 실행되면 안 됨
      expect(mockSignOut).not.toHaveBeenCalled();
      expect(mockClear).not.toHaveBeenCalled();
    });

    test('에러 메시지가 없는 경우 기본 메시지("회원탈퇴 중 오류가 발생했습니다.")를 띄워야 한다', async () => {
      // Given: 메시지가 빈 에러 객체 생성
      const error = new Error();
      error.message = '';
      mockWithdraw.mockRejectedValue(error);

      const { result } = renderHook(() => useUserMutation());

      // When
      act(() => {
        result.current.withdrawMutation.mutate();
      });

      // Then
      await waitFor(() => expect(result.current.withdrawMutation.isError).toBe(true));

      // 기본 메시지 확인
      expect(mockToastError).toHaveBeenCalledWith('회원탈퇴 중 오류가 발생했습니다.');
    });
  });

  describe('updateDisplayNameMutation (이름 변경)', () => {
    test('이름 변경 성공 시 API를 호출하고 성공 토스트를 띄워야 한다', async () => {
      // Given
      mockUpdateDisplayName.mockResolvedValue(undefined);
      const newName = '새로운 닉네임';

      const { result } = renderHook(() => useUserMutation());

      // When
      act(() => {
        result.current.updateDisplayNameMutation.mutate(newName);
      });

      // Then
      await waitFor(() => expect(result.current.updateDisplayNameMutation.isSuccess).toBe(true));

      // 1. API가 올바른 인자로 호출되었는지 확인
      expect(mockUpdateDisplayName).toHaveBeenCalledWith(newName);

      // 2. 성공 토스트 확인
      expect(mockToastSuccess).toHaveBeenCalledWith('보여질 이름이 변경되었습니다.');
    });

    test('이름 변경 실패 시 에러 토스트를 띄워야 한다', async () => {
      // Given
      const errorMessage = '이미 사용 중인 이름입니다.';
      mockUpdateDisplayName.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useUserMutation());

      // When
      act(() => {
        result.current.updateDisplayNameMutation.mutate('중복 이름');
      });

      // Then
      await waitFor(() => expect(result.current.updateDisplayNameMutation.isError).toBe(true));

      // 1. 에러 토스트 확인
      expect(mockToastError).toHaveBeenCalledWith(errorMessage);
    });

    test('에러 메시지가 없는 경우 기본 메시지를 띄워야 한다', async () => {
      // Given: 메시지 없는 에러
      mockUpdateDisplayName.mockRejectedValue(new Error(''));

      const { result } = renderHook(() => useUserMutation());

      act(() => {
        result.current.updateDisplayNameMutation.mutate('테스트');
      });

      await waitFor(() => expect(result.current.updateDisplayNameMutation.isError).toBe(true));

      // 기본 메시지 확인
      expect(mockToastError).toHaveBeenCalledWith('이름 변경 중 오류가 발생했습니다.');
    });
  });
});
