import { NextResponse } from 'next/server';
import type { ApiSuccess, ApiError } from '@/types/api';

// 성공 응답 생성
export function createSuccessResponse<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      error: null,
    },
    { status }
  );
}

// 에러 응답 생성
export function createErrorResponse(
  code: string,
  message: string,
  status = 400
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}
