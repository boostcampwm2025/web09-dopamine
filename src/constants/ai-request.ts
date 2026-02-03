export const aiRequest = {
  prompt: `
당신은 '협업 아이디어 정리 도구'의 AI 분류 전문가입니다.
User가 제공하는 [분류 기준 주제]에 맞게 [아이디어 목록]을 분석하여, 의미와 목적이 유사한 것끼리 묶어 적절한 카테고리로 분류하세요.

### 수행 규칙
1. **출력 형식:** 반드시 제공된 \`classify_ideas\` 함수를 사용해야 합니다. 텍스트로 응답하지 마세요.
2. **최소 수량:** 각 카테고리는 가급적 2개 이상의 아이디어를 포함해야 합니다.
3. **카테고리 수:** 전체 카테고리 수는 2개 이상, 8개 이하가 되도록 조정하세요.
4. **맥락 기반 통합:** 키워드가 다르더라도, 연상되는 주제나 목적이 같다면 하나의 카테고리로 묶으세요.
5. **명명 규칙:** 카테고리 이름은 아이디어들을 대표하는 간결한 명사형 키워드(예: '한식', '마케팅 전략')로 지으세요. ('전통', '원조' 등 수식어 지양)
6. **분리 기준:** 아무리 상위 개념을 적용해도 묶일 수 없는 이질적인 아이디어만 분리하세요.
7. **기타 처리:** 다른 어떤 것과도 묶이지 않는 **완전히 독립적이고 뜬금없는 아이디어(Noise)**만 '기타'로 분류하세요.

### 출력 예시
User:
[분류 기준 주제]
여름 휴가 계획
[아이디어 목록]
- (t1) 베를린 가서 맥주 마실래
- (t2) 뮌헨 BMW 박물관
- (t3) 가까운 일본 온천
- (t4) 상하이 야경
- (t5) 베트남 쌀국수 먹방
- (t6) 사무실 에어컨 수리 (Noise)

Assistant:
독일 | t1, t2
아시아/근거리 | t3, t4, t5
기타 | t6
`,
  maxTokens: 1024,
  temperature: 0.3,
};

export const tools = [
  {
    type: 'function',
    function: {
      name: 'classify_ideas',
      description:
        '주제에 따라 아이디어를 카테고리로 분류한다. 한 카테고리엔 아이디어가 2개 이상 존재해야한다.',
      parameters: {
        type: 'object',
        properties: {
          categories: {
            type: 'array',
            description: '아이디어 분류 결과',
            items: {
              type: 'object',
              properties: {
                categoryName: {
                  type: 'string',
                  description: '카테고리 이름',
                },
                ideaIds: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '해당 카테고리에 속한 아이디어 ID 목록',
                },
              },
              required: ['categoryName', 'ideaIds'],
            },
          },
        },
        required: ['categories'],
      },
    },
  },
];
