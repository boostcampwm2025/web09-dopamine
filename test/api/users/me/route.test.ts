import { getServerSession } from 'next-auth';
import { expectErrorResponse, expectSuccessResponse } from '@test/utils/api-test-helpers';
import { PATCH } from '@/app/api/users/me/route';
import { CLIENT_ERROR_MESSAGES } from '@/constants/error-messages';
import { updateUserWithIssueMemberNickname } from '@/lib/repositories/user.repository';

// 1. 모킹 설정
jest.mock('next-auth');
jest.mock('@/lib/repositories/user.repository');
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));
// 라이브러리 충돌 방지용
jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(() => ({})),
}));

describe('PATCH /api/users/me', () => {
  const userId = 'user-1';

  // Mock 함수 타입 캐스팅
  const mockedGetServerSession = getServerSession as jest.Mock;
  const mockedUpdateUser = updateUserWithIssueMemberNickname as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // 기본적으로 로그인 상태 가정
    mockedGetServerSession.mockResolvedValue({ user: { id: userId } });
    // 콘솔 에러 숨기기
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Request 생성 헬퍼 함수
  const createRequest = (body: object) => {
    return new Request('http://localhost:3000/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  };

  it('로그인하지 않은 경우 401 에러를 반환한다', async () => {
    // Given: 세션 없음
    mockedGetServerSession.mockResolvedValue(null);
    const req = createRequest({ displayName: 'NewName' });

    // When
    const response = await PATCH(req);

    // Then
    await expectErrorResponse(response, 401, 'UNAUTHORIZED');
  });

  it('닉네임이 비어있거나 공백뿐이면 400 에러를 반환한다', async () => {
    // Given: 공백 닉네임
    const req = createRequest({ displayName: '   ' });

    // When
    const response = await PATCH(req);

    // Then
    const data = await expectErrorResponse(response, 400, 'BAD_REQUEST');
    // 에러 메시지도 함께 검증 (createErrorResponse 구현에 따라 data.message 위치가 다를 수 있음)
    // 보통 data.message 혹은 data.error.message 등을 확인
    expect(data.message || data.error.message).toBe(CLIENT_ERROR_MESSAGES.INVALID_DISPLAYNAME);
  });

  it('닉네임이 10글자를 초과하면 400 에러를 반환한다', async () => {
    // Given: 11글자
    const req = createRequest({ displayName: '12345678901' });

    // When
    const response = await PATCH(req);

    // Then
    await expectErrorResponse(response, 400, 'BAD_REQUEST');
  });

  it('유효한 닉네임은 양쪽 공백을 제거하고 업데이트한다', async () => {
    // Given: 앞뒤 공백이 있는 유효한 이름
    const inputName = '  CoolUser  ';
    const trimmedName = 'CoolUser';

    mockedUpdateUser.mockResolvedValue({
      id: userId,
      displayName: trimmedName,
    });

    const req = createRequest({ displayName: inputName });

    // When
    const response = await PATCH(req);

    // Then
    const data = await expectSuccessResponse(response, 200);
    expect(data.displayName).toBe(trimmedName);

    expect(mockedUpdateUser).toHaveBeenCalledWith(userId, trimmedName);
  });

  it('DB 업데이트 중 에러가 발생하면 500 에러를 반환한다', async () => {
    // Given: DB 에러
    mockedUpdateUser.mockRejectedValue(new Error('DB Connection Failed'));
    const req = createRequest({ displayName: 'ValidName' });

    // When
    const response = await PATCH(req);

    // Then
    await expectErrorResponse(response, 500, 'INTERNAL_SERVER_ERROR');
  });
});
