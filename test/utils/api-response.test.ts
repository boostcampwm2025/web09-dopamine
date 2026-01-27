import getAPIResponseData, { ApiError } from '@/lib/utils/api-response';
import { CLIENT_ERROR_MESSAGES } from '@/constants/error-messages';

describe('getAPIResponseData', () => {
  const mockFetch = jest.fn();
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // fetch와 console.error를 모킹해 테스트 로그를 정리
    (global as any).fetch = mockFetch;
    mockFetch.mockReset();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('성공 응답이면 data를 그대로 반환한다', async () => {
    // 성공 응답을 반환하도록 fetch 모킹
    mockFetch.mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: { id: 'data-1' },
        error: null,
      }),
    });

    const result = await getAPIResponseData({ url: '/api/test', method: 'GET' });

    expect(result).toEqual({ id: 'data-1' });
  });

  it('JSON 파싱 실패 시 JSON_PARSE_ERROR를 던진다', async () => {
    // response.json이 실패하는 경우
    mockFetch.mockResolvedValue({
      status: 500,
      json: jest.fn().mockRejectedValue(new Error('invalid json')),
    });

    const promise = getAPIResponseData({ url: '/api/test', method: 'GET' });

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      code: 'JSON_PARSE_ERROR',
      message: '서버 응답을 처리할 수 없습니다.',
    });
  });

  it('실패 응답에서 코드가 매핑되면 클라이언트 메시지를 사용한다', async () => {
    // CLIENT_ERROR_MESSAGES에 매핑된 코드 사용
    mockFetch.mockResolvedValue({
      status: 400,
      json: jest.fn().mockResolvedValue({
        success: false,
        data: null,
        error: {
          code: 'INVALID_VOTE_REQUEST',
          message: '서버 메시지',
        },
      }),
    });

    await expect(getAPIResponseData({ url: '/api/test', method: 'GET' })).rejects.toMatchObject({
      code: 'INVALID_VOTE_REQUEST',
      message: CLIENT_ERROR_MESSAGES.INVALID_VOTE_REQUEST,
    });
  });

  it('실패 응답에서 매핑이 없으면 서버 메시지를 사용한다', async () => {
    // 매핑되지 않은 코드 + 서버 메시지 사용
    mockFetch.mockResolvedValue({
      status: 400,
      json: jest.fn().mockResolvedValue({
        success: false,
        data: null,
        error: {
          code: 'SOME_NEW_CODE',
          message: '서버 메시지',
        },
      }),
    });

    await expect(getAPIResponseData({ url: '/api/test', method: 'GET' })).rejects.toMatchObject({
      code: 'SOME_NEW_CODE',
      message: '서버 메시지',
    });
  });
});
