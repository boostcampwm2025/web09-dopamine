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
    const apiResponse: ApiResponse<T> = await response.json();

    // API 응답이 실패인 경우
    if (!apiResponse.success) {
      const errorCode = apiResponse.error.code;
      const errorMessage = CLIENT_ERROR_MESSAGES[errorCode] || apiResponse.error.message;

      throw new Error(errorMessage);
    }

    // 성공한 경우 데이터 반환
    return apiResponse.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export default getAPIResponseData;
