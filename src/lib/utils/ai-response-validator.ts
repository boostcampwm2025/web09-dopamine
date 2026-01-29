// Function Calling 방식 AI 응답 타입
interface AIFunctionCallResponse {
  result?: {
    message?: {
      toolCalls?: Array<{
        function: {
          arguments: {
            categories: Array<{
              categoryName: string;
              ideaIds: string[];
            }>;
          };
        };
      }>;
    };
  };
}

interface FunctionCallValidationResult {
  isValid: boolean;
  error?: string;
  data?: Array<{
    title: string;
    ideaIds: string[];
  }>;
}

// Function Calling 방식의 AI 응답을 검증
export function validateAIFunctionCallResponse(
  aiResponse: AIFunctionCallResponse,
): FunctionCallValidationResult {
  // 1. toolCalls 존재 여부 확인
  const toolCalls = aiResponse.result?.message?.toolCalls;

  if (!toolCalls || toolCalls.length === 0) {
    return {
      isValid: false,
      error: 'AI가 분류할 수 없는 아이디어들입니다.',
    };
  }

  // 2. function arguments 추출
  const args = toolCalls[0].function.arguments;

  if (!args) {
    return {
      isValid: false,
      error: 'AI 응답에 function arguments가 없습니다.',
    };
  }

  // 3. categories 배열 검증
  if (!args.categories || !Array.isArray(args.categories)) {
    return {
      isValid: false,
      error: 'categories 배열이 존재하지 않습니다.',
    };
  }

  if (args.categories.length === 0) {
    return {
      isValid: false,
      error: 'AI 카테고리화에 실패했습니다. (카테고리가 비어있음)',
    };
  }

  // 4. 카테고리 데이터를 서비스에서 사용할 형식으로 변환
  const categoryPayloads = args.categories.map((category) => ({
    title: category.categoryName,
    ideaIds: category.ideaIds,
  }));

  return {
    isValid: true,
    data: categoryPayloads,
  };
}
