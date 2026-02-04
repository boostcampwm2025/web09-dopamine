export const CLIENT_ERROR_MESSAGES: Record<string, string> = {
  // 공통
  API_NOT_FOUND: '요청한 기능을 찾을 수 없습니다. 잠시 후 다시 시도해주세요.',
  PERMISSION_DENIED: '접근 권한이 없습니다.',
  INTERNAL_ERROR: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  VALIDATION_FAILED: '입력한 값이 올바르지 않습니다. 다시 확인해주세요.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
  UNAUTHORIZED_USER: '로그인이 필요합니다.',

  // 카테고리
  CATEGORY_NOT_FOUND: '카테고리를 찾을 수 없습니다.',
  CATEGORY_CREATE_FAILED: '카테고리 생성에 실패했습니다.',
  CATEGORY_UPDATE_FAILED: '카테고리 수정에 실패했습니다.',
  CATEGORY_DELETE_FAILED: '카테고리 삭제에 실패했습니다.',
  CATEGORY_ALREADY_EXISTS: '이미 존재하는 카테고리 이름입니다.',

  // 이슈
  ISSUE_NOT_FOUND: '존재하지 않는 이슈입니다.',
  ISSUE_FETCH_FAILED: '이슈 조회에 실패했습니다.',
  ISSUE_CREATE_FAILED: '이슈 생성에 실패했습니다.',
  ISSUE_UPDATE_FAILED: '이슈 수정에 실패했습니다.',
  ISSUE_STATUS_UPDATE_FAILED: '이슈 상태 변경에 실패했습니다.',
  INVALID_ISSUE_STATUS: '유효하지 않은 이슈 상태입니다.',
  NICKNAME_AND_TITLE_REQUIRED: 'nickname과 title은 필수입니다.',
  SELECTED_IDEA_ID_REQUIRED: '선택된 아이디어 ID가 필요합니다.',
  IDEA_SELECTION_BROADCAST_FAILED: '아이디어 선택 알림에 실패했습니다.',

  // 멤버
  MEMBERS_NOT_FOUND: '참여자가 존재하지 않습니다.',
  MEMBERS_FETCH_FAILED: '참여자 조회에 실패했습니다.',
  MEMBER_NOT_FOUND: '참여자를 찾을 수 없습니다.',
  MEMBER_FETCH_FAILED: '사용자 정보 조회에 실패했습니다.',
  MEMBER_JOIN_FAILED: '이슈 참여에 실패했습니다.',
  NICKNAME_REQUIRED: 'nickname은 필수입니다.',
  NICKNAME_GENERATION_FAILED: '닉네임 생성에 실패했습니다.',
  USER_ID_REQUIRED: 'User ID가 필요합니다.',
  OWNER_PERMISSION_REQUIRED: '방장 권한이 필요합니다.',

  // 프로젝트 초대
  INVITATION_NOT_FOUND: '유효하지 않은 초대 링크입니다.',
  INVITATION_TOKEN_CREATE_FAILED: '초대 링크를 생성할 수 없습니다.',
  PROJECT_JOIN_FAILED: '프로젝트에 참여할 수 없습니다.',
  CODE_REQUIRED: '초대 코드가 필요합니다.',
  INVITATION_EXPIRED: '만료된 초대 링크입니다.',
  EMAIL_NOT_AUTHORIZED: '유효하지 않은 이메일입니다. 다른 계정으로 참여해주세요.',
  ALREADY_EXISTED: '이미 참여중인 프로젝트입니다. 프로젝트 페이지로 이동합니다.',

  // 카테고리 AI 구조화
  CATEGORIES_REQUIRED: '카테고리 데이터가 필요합니다.',
  INVALID_AI_CATEGORIES: 'AI 카테고리 데이터가 유효하지 않습니다.',
  AI_CATEGORIZATION_FAILED: 'AI 카테고리화에 실패했습니다.',

  // 아이디어
  IDEA_DETAIL_FETCH_FAILED: '아이디어 상세 조회에 실패했습니다.',
  IDEA_NOT_FOUND: '아이디어를 찾을 수 없습니다.',
  IDEA_FETCH_FAILED: '아이디어 조회에 실패했습니다.',
  IDEA_CREATE_FAILED: '아이디어 생성에 실패했습니다.',
  IDEA_DELETE_FAILED: '아이디어 삭제에 실패했습니다.',
  IDEA_UPDATE_FAILED: '아이디어 수정에 실패했습니다.',
  IDEA_ID_REQUIRED: '아이디어 ID가 필요합니다.',

  // 투표
  INVALID_VOTE_REQUEST: '잘못된 투표 요청입니다.',
  VOTE_FAILED: '투표 처리 중 오류가 발생했습니다.',

  // 리포트
  REPORT_NOT_FOUND: '리포트를 찾을 수 없습니다.',
  WORD_CLOUD_FETCH_FAILED: '워드클라우드 조회에 실패했습니다.',
  WORD_CLOUD_CREATE_FAILED: '워드클라우드 생성에 실패했습니다.',

  // 마이페이지
  INVALID_DISPLAYNAME: '잘못된 닉네임 형식입니다.',
};
