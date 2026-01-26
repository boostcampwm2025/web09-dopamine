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
            content:
              '너는 협업 아이디어를 분류하는 AI다. 아이디어를 의미와 목적이 유사한 것끼리 묶어 카테고리로 분류하라. 사소한 차이로 카테고리를 분리하지 말고, 가능한 한 통합하라. 각 카테고리는 최소 2개 이상의 아이디어를 포함해야 하며, 전체 카테고리 수는 2개 이상 8개 이하로 제한한다.',
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
