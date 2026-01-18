export const CLIENT_ERROR_MESSAGES: Record<string, string> = {
  // 공통
  API_NOT_FOUND: '요청한 기능을 찾을 수 없습니다. 잠시 후 다시 시도해주세요.',
  PERMISSION_DENIED: '접근 권한이 없습니다.',
  INTERNAL_ERROR: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  VALIDATION_FAILED: '입력한 값이 올바르지 않습니다. 다시 확인해주세요.',

  // 카테고리
  CATEGORY_NOT_FOUND: '카테고리를 찾을 수 없습니다.',
  CATEGORY_CREATE_FAILED: '카테고리 생성에 실패했습니다.',
  CATEGORY_UPDATE_FAILED: '카테고리 수정에 실패했습니다.',
  CATEGORY_DELETE_FAILED: '카테고리 삭제에 실패했습니다.',
};
  