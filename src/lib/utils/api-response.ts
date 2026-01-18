import { CLIENT_ERROR_MESSAGES } from '@/constants/error-messages';
import toast from 'react-hot-toast';
import type { ApiResponse } from '@/types/api';

interface FetchOptions extends RequestInit {
  url: string;
}

const getAPIResponseData = async <T>(options: FetchOptions): Promise<T> => {
  try {
    const { url, ...fetchOptions } = options;
    const response = await fetch(url, fetchOptions);

    // 응답이 JSON이 아닌 경우 처리
    let apiResponse: ApiResponse<T>;
    try {
      apiResponse = await response.json();
    } catch (jsonError) {
      console.error('JSON 파싱 실패:', { url, status: response.status, jsonError });
      throw new Error('서버 응답을 처리할 수 없습니다.');
    }

    // API 응답이 실패인 경우
    if (!apiResponse.success) {
      const errorCode = apiResponse.error?.code || 'UNKNOWN_ERROR';
      const errorMessage =
        CLIENT_ERROR_MESSAGES[errorCode] || apiResponse.error?.message || '알 수 없는 오류가 발생했습니다.';

      throw new Error(errorMessage);
    }

    // 성공한 경우 데이터 반환
    return apiResponse.data;
  } catch (e) {
    console.error('API 요청 실패:', { url: options.url, error: e });
    throw e;
  }
};

export default getAPIResponseData;
