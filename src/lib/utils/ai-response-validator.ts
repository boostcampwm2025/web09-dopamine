interface Category {
  title: string;
  ideaIds: string[];
}

interface CategorizeResult {
  categories: Category[];
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: CategorizeResult;
}

export function validateAIResponse(aiResponse: any, inputIdeaIds: string[]): ValidationResult {
  // AI 응답 존재 여부 확인
  const result = aiResponse.result?.message?.content;

  if (!result) {
    return {
      isValid: false,
      error: 'AI 응답이 올바르지 않습니다.',
    };
  }

  // JSON 파싱
  let parsedResult: CategorizeResult;
  try {
    parsedResult = JSON.parse(result);
  } catch (error) {
    return {
      isValid: false,
      error: 'AI 응답을 JSON으로 파싱할 수 없습니다.',
    };
  }

  // categories 배열 검증
  if (!parsedResult.categories || !Array.isArray(parsedResult.categories)) {
    return {
      isValid: false,
      error: 'categories 배열이 존재하지 않습니다.',
    };
  }

  // 최소 2개 이상의 카테고리 검증
  if (parsedResult.categories.length < 2) {
    return {
      isValid: false,
      error: '카테고리는 최소 2개 이상이어야 합니다.',
    };
  }

  // 각 카테고리 구조 검증
  for (const category of parsedResult.categories) {
    if (!category.title || typeof category.title !== 'string') {
      return {
        isValid: false,
        error: '카테고리에 올바른 title이 없습니다.',
      };
    }
    if (!category.ideaIds || !Array.isArray(category.ideaIds)) {
      return {
        isValid: false,
        error: '카테고리에 ideaIds 배열이 없습니다.',
      };
    }
  }

  // 모든 입력 idea id가 카테고리에 포함되었는지 검증
  const inputIdeaIdsSet = new Set(inputIdeaIds);
  const categorizedIdeaIds = new Set(parsedResult.categories.flatMap((c) => c.ideaIds));

  for (const ideaId of inputIdeaIdsSet) {
    if (!categorizedIdeaIds.has(ideaId)) {
      return {
        isValid: false,
        error: `아이디어 ${ideaId}가 카테고리에 포함되지 않았습니다.`,
      };
    }
  }

  return {
    isValid: true,
    data: parsedResult,
  };
}
