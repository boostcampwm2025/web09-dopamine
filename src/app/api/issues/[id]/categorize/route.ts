import { NextRequest } from 'next/server';
import aiRequest from '@/constants/ai-request';
import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { findIssueById } from '@/lib/repositories/issue.repository';
import { categorizeService } from '@/lib/services/categorize.service';
import { broadcast } from '@/lib/sse/sse-service';
import { parseAiResponse, validateAIResponse } from '@/lib/utils/ai-response-validator';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';
import { broadcastError } from '@/lib/utils/broadcast-helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: issueId } = await params;

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
            content: aiRequest.prompt.trim(),
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
        maxTokens: aiRequest.maxTokens,
        temperature: aiRequest.temperature,
      }),
    });

    const data = await res.json();
    const parsedData = parseAiResponse(data.result.message.content);

    // validate
    // const inputIdeaIds = ideas.map((i) => i.id);
    // const validation = validateAIResponse(data, inputIdeaIds);

    // if (!validation.isValid) {
    //   broadcastError(issueId, 'AI 응답 검증에 실패했습니다.');
    //   return createErrorResponse('AI_RESPONSE_VALIDATION_FAILED', 500);
    // }

    if (!parsedData || parsedData === null) {
      broadcastError(issueId, 'AI 카테고리화에 실패했습니다.');
      return createErrorResponse('AI_CATEGORIZATION_FAILED', 500);
    }

    // DB 업데이트 및 브로드캐스팅
    const categoryPayloads = parsedData.categories.map((category) => ({
      title: category.title,
      ideaIds: category.ideaIds,
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
    console.error('AI 카테고리화 실패:', error);

    broadcastError(issueId, '서버 내부 오류로 AI 분류에 실패했습니다.');

    return createErrorResponse('AI_CATEGORIZATION_FAILED', 500);
  }
}
