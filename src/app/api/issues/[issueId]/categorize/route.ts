import { NextRequest } from 'next/server';
import { aiRequest, tools } from '@/constants/ai-request';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { findIssueById } from '@/lib/repositories/issue.repository';
import { categorizeService } from '@/lib/services/categorize.service';
import { broadcast } from '@/lib/sse/sse-service';
import { validateAIFunctionCallResponse } from '@/lib/utils/ai-response-validator';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';
import { broadcastError } from '@/lib/utils/broadcast-helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ issueId: string }> }) {
  const { issueId } = await params;

  try {
    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.AI_STRUCTURING_STARTED,
        data: {},
      },
    });

    // DB에서 아이디어 조회
    const ideas = await ideaRepository.findIdAndContentByIssueId(issueId);
    const issue = await findIssueById(issueId);

    if (ideas.length === 0) {
      broadcastError(issueId, '분류할 아이디어가 없습니다.');
      return createErrorResponse('NO_IDEAS_TO_CATEGORIZE', 400);
    }

    if (!issue) {
      broadcastError(issueId, '이슈가 존재하지 않습니다.');
      return createErrorResponse('ISSUE_NOT_FOUND', 400);
    }

    const systemContent = `
당신은 협업 팀의 브레인스토밍 세션을 돕는 전문 퍼실리테이터 AI입니다.

[맥락]
팀원들이 "${issue.title}"라는 주제로 브레인스토밍을 진행했고, 다양한 아이디어들이 제시되었습니다. 이제 이 아이디어들을 체계적으로 정리하여 팀이 다음 단계로 나아갈 수 있도록 도와야 합니다.

[명령]
제시된 아이디어들을 의미와 목적이 유사한 것끼리 묶어 카테고리로 분류하세요. 각 카테고리에는 명확하고 직관적인 이름을 부여하세요.

[분류 원칙]
1. 의미적 유사성: 비슷한 주제, 목적, 또는 해결하려는 문제가 같은 아이디어를 묶습니다
2. 통합 우선: 사소한 차이로 카테고리를 분리하지 말고, 가능한 한 통합합니다
3. 균형 유지: 각 카테고리는 최소 2개 이상의 아이디어를 포함해야 합니다
4. 적절한 개수: 전체 카테고리는 2개 이상 8개 이하로 제한합니다

[예시]
주제: "팀 생산성 향상 방안"
아이디어:
- 매일 아침 15분 스탠드업 미팅 도입
- 주간 회고 시간 정례화
- 업무 자동화 도구 도입
- CI/CD 파이프라인 구축
- 페어 프로그래밍 시간 확대

분류 결과:
✓ "커뮤니케이션 강화" → 스탠드업 미팅, 회고 시간
✓ "개발 효율화" → 자동화 도구, CI/CD 파이프라인, 페어 프로그래밍

[포맷]
- 반드시 classify_ideas 함수를 사용하여 응답하세요
- 각 아이디어는 정확히 하나의 카테고리에만 속합니다
- 모든 아이디어가 빠짐없이 분류되어야 합니다
- 카테고리명은 한글로 작성하며, 2~4단어로 간결하게 표현하세요
    `;

    const userContent = `
        [분류 기준 주제]
        ${issue.title}

        [아이디어 목록]
        ${ideas.map((i) => `- (${i.id}) ${i.content}`).join('\n')}`;

    const toolChoice = {
      type: 'function',
      function: {
        name: 'classify_ideas',
      },
    };

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
            content: systemContent,
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
        tools,
        toolChoice,
        maxTokens: aiRequest.maxTokens,
        temperature: aiRequest.temperature,
      }),
    });

    const data = await res.json();

    // AI 응답 검증 및 파싱
    const validationResult = validateAIFunctionCallResponse(data);

    if (!validationResult.isValid || !validationResult.data) {
      console.error('AI 응답 검증 실패:', validationResult.error);
      broadcastError(issueId, validationResult.error || 'AI 응답 형식이 올바르지 않습니다.');
      return createErrorResponse('AI_RESPONSE_INVALID', 500);
    }

    const categoryPayloads = validationResult.data;

    const result = await categorizeService.categorizeAndBroadcast(issueId, categoryPayloads);

    broadcast({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.AI_STRUCTURING_COMPLETED,
        data: {},
      },
    });

    return createSuccessResponse(result);
  } catch (error) {
    console.error('[AI 카테고리화] 에러 발생:', error);
    broadcastError(issueId, '서버 내부 오류로 AI 분류에 실패했습니다.');

    return createErrorResponse('AI_CATEGORIZATION_FAILED', 500);
  }
}
