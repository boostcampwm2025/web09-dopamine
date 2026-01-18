import { NextResponse } from 'next/server';

import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch('https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-005', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CLOVA_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-NCP-CLOVASTUDIO-REQUEST-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: `
너는 협업 아이디어 정리 도구의 AI 어시스턴트다.

사용자가 작성한 여러 개의 아이디어를 읽고,
의미와 주제를 기준으로 아이디어들을 카테고리로 분류하는 역할을 한다.

다음 규칙을 반드시 지켜라:

1. 출력은 반드시 JSON 형식이어야 한다.
2. 설명 문장, 마크다운, 코드블록(\`\`\`)을 절대 포함하지 마라.
3. 입력으로 받은 idea의 id 값은 절대 수정하거나 새로 만들지 마라.
4. 모든 idea는 반드시 하나의 카테고리에 포함되어야 한다.
5. 카테고리 이름은 사람이 이해하기 쉬운 짧은 명사형(예: 콘텐츠 마케팅, 유료 광고 등)으로 작성하라.
6. 카테고리는 최소 2개 이상 생성하라.
7. 카테고리의 개수는 아이디어 수에 비례하여 적절히 조정하라.

출력 JSON 예시는 다음과 같다:

{
  "categories": [
    {
      "title": "카테고리 이름",
      "ideaIds": ["idea-1", "idea-2"]
    }
  ]
}
            `.trim(),
        },
        {
          role: 'user',
          content: body.ideas
            .map((i: { id: string; content: string }) => `(${i.id}) ${i.content}`)
            .join('\n'),
        },
      ],
      maxTokens: 512,
      temperature: 0.2,
    }),
  });

    const data = await res.json();
    return createSuccessResponse(data);
  } catch (error) {
    console.error('AI 카테고리화 실패:', error);
    return createErrorResponse('AI_CATEGORIZATION_FAILED', 500);
  }
}
