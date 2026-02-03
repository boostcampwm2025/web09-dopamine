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

    // ID 매핑: UUID -> Index
    const idMap = new Map<string, string>(); // Index -> UUID
    const mappedIdeas = ideas.map((idea, index) => {
      const mappedId = (index + 1).toString();
      idMap.set(mappedId, idea.id);
      return { ...idea, mappedId };
    });

    const userContent = `
        [분류 기준 주제]
        ${issue.title}

        [아이디어 목록]
        ${mappedIdeas.map((i) => `- (${i.mappedId}) ${i.content}`).join('\n')}`;

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
            content: aiRequest.prompt,
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

    // Index -> UUID 복원
    const categoryPayloads = validationResult.data.map((category) => ({
      title: category.title,
      ideaIds: category.ideaIds
        .map((id) => idMap.get(id)) // Index를 UUID로 변환
        .filter((id): id is string => !!id), // 유효하지 않은 매핑핑 제거
    }));

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
