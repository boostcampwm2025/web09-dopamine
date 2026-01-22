// API 응답의 성공 케이스
export interface ApiSuccess<T> {
  success: true;
  data: T;
  error: null;
}

// API 응답의 실패 케이스
export interface ApiError {
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
  };
}

// API 응답 타입 (성공 또는 실패)
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
