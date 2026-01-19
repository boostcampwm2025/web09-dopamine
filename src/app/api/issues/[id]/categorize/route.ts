import { NextRequest, NextResponse } from 'next/server';
import aiRequest from '@/constants/ai-request';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { categorizeService } from '@/lib/services/categorize.service';
import { validateAIResponse } from '@/lib/utils/ai-response-validator';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: issueId } = await params;

  try {
    // DB에서 아이디어 조회
    const ideas = await ideaRepository.findIdAndContentByIssueId(issueId);

    if (ideas.length === 0) {
      return createErrorResponse('NO_IDEAS_TO_CATEGORIZE', 400);
    }

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
            content: ideas.map((i) => `(${i.id}) ${i.content}`).join('\n'),
          },
        ],
        maxTokens: aiRequest.maxTokens,
        temperature: aiRequest.temperature,
      }),
    });

    const data = await res.json();

    // validate
    const inputIdeaIds = ideas.map((i) => i.id);
    const validation = validateAIResponse(data, inputIdeaIds);

    if (!validation.isValid) {
      return createErrorResponse('AI_RESPONSE_VALIDATION_FAILED', 500);
    }

    // DB 업데이트 및 브로드캐스팅
    const categoryPayloads = validation.data!.categories.map((category) => ({
      title: category.title,
      ideaIds: category.ideaIds,
    }));

    const result = await categorizeService.categorizeAndBroadcast(issueId, categoryPayloads);

    return createSuccessResponse(result);
  } catch (error) {
    console.error('AI 카테고리화 실패:', error);
    return createErrorResponse('AI_CATEGORIZATION_FAILED', 500);
  }
}
