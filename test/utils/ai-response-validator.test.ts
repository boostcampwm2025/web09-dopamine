import { validateAIFunctionCallResponse } from '@/lib/utils/ai-response-validator';

describe('validateAIFunctionCallResponse', () => {
  it('toolCalls가 없으면 유효하지 않다고 판단한다', () => {
    // toolCalls가 없는 응답을 전달
    const result = validateAIFunctionCallResponse({} as any);

    expect(result).toEqual({
      isValid: false,
      error: 'AI가 분류할 수 없는 아이디어들입니다.',
    });
  });

  it('function arguments가 없으면 유효하지 않다고 판단한다', () => {
    // toolCalls는 있지만 arguments가 없는 케이스
    const result = validateAIFunctionCallResponse({
      result: {
        message: {
          toolCalls: [{ function: {} as any }],
        },
      },
    });

    expect(result).toEqual({
      isValid: false,
      error: 'AI 응답에 function arguments가 없습니다.',
    });
  });

  it('categories가 배열이 아니면 유효하지 않다고 판단한다', () => {
    // categories가 잘못된 타입인 케이스
    const result = validateAIFunctionCallResponse({
      result: {
        message: {
          toolCalls: [
            {
              function: {
                arguments: { categories: 'invalid' as any },
              },
            },
          ],
        },
      },
    });

    expect(result).toEqual({
      isValid: false,
      error: 'categories 배열이 존재하지 않습니다.',
    });
  });

  it('categories가 비어 있으면 실패로 반환한다', () => {
    // categories가 빈 배열인 케이스
    const result = validateAIFunctionCallResponse({
      result: {
        message: {
          toolCalls: [
            {
              function: {
                arguments: { categories: [] },
              },
            },
          ],
        },
      },
    });

    expect(result).toEqual({
      isValid: false,
      error: 'AI 카테고리화에 실패했습니다. (카테고리가 비어있음)',
    });
  });

  it('정상 응답이면 카테고리 payload로 변환한다', () => {
    // 정상 응답 케이스
    const result = validateAIFunctionCallResponse({
      result: {
        message: {
          toolCalls: [
            {
              function: {
                arguments: {
                  categories: [
                    { categoryName: 'A', ideaIds: ['idea-1', 'idea-2'] },
                    { categoryName: 'B', ideaIds: ['idea-3'] },
                  ],
                },
              },
            },
          ],
        },
      },
    });

    expect(result).toEqual({
      isValid: true,
      data: [
        { title: 'A', ideaIds: ['idea-1', 'idea-2'] },
        { title: 'B', ideaIds: ['idea-3'] },
      ],
    });
  });
});
