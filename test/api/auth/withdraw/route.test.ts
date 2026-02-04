import { getServerSession } from 'next-auth';
import { expectErrorResponse, expectSuccessResponse } from '@test/utils/api-test-helpers';
import { DELETE } from '@/app/api/auth/withdraw/route';
import { deleteUser } from '@/lib/repositories/user.repository';

// 1. 외부 모듈 모킹
jest.mock('next-auth');
jest.mock('@/lib/repositories/user.repository');
jest.mock('@/lib/auth', () => ({
  authOptions: {}, // authOptions는 빈 객체로 모킹
}));

describe('DELETE /api/auth/withdraw', () => {
  // Mock 함수 타입 캐스팅
  const mockedGetServerSession = getServerSession as jest.Mock;
  const mockedDeleteUser = deleteUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // 콘솔 에러 로그 숨기기 (테스트 결과 깔끔하게)
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('세션이 없거나 유저 ID가 없으면 401 에러를 반환한다', async () => {
    // Given: 세션 없음 (null)
    mockedGetServerSession.mockResolvedValue(null);

    // When
    const response = await DELETE();

    // Then
    await expectErrorResponse(response, 401, 'UNAUTHORIZED');
    expect(mockedDeleteUser).not.toHaveBeenCalled();
  });

  it('회원탈퇴가 성공하면 200 응답을 반환한다', async () => {
    // Given: 정상 세션
    const userId = 'user-123';
    mockedGetServerSession.mockResolvedValue({
      user: { id: userId },
    });
    mockedDeleteUser.mockResolvedValue(undefined); // 삭제 성공

    // When
    const response = await DELETE();

    // Then
    const data = await expectSuccessResponse(response, 200);
    expect(data.message).toBe('회원탈퇴가 완료되었습니다.');

    // Repository가 올바른 ID로 호출되었는지 확인
    expect(mockedDeleteUser).toHaveBeenCalledWith(userId);
  });

  it('DB 에러 발생 시 500 에러를 반환한다', async () => {
    // Given: 정상 세션이지만 DB 에러 발생
    mockedGetServerSession.mockResolvedValue({
      user: { id: 'user-123' },
    });
    mockedDeleteUser.mockRejectedValue(new Error('Database connection failed'));

    // When
    const response = await DELETE();

    // Then
    await expectErrorResponse(response, 500, 'INTERNAL_SERVER_ERROR');
  });
});
