import { NextRequest, NextResponse } from 'next/server';
import aiRequest from '@/constants/ai-request';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { categorizeService } from '@/lib/services/categorize.service';
import { validateAIResponse } from '@/utils/ai-response-validator';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: issueId } = await params;

  // DB에서 아이디어 조회
  const ideas = await ideaRepository.findIdAndContentByIssueId(issueId);

  if (ideas.length === 0) {
    return NextResponse.json({ error: '분류할 아이디어가 없습니다.' }, { status: 400 });
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

  //validate
  const inputIdeaIds = ideas.map((i) => i.id);
  const validation = validateAIResponse(data, inputIdeaIds);

  if (!validation.isValid) {
    return NextResponse.json({ error: validation.error }, { status: 500 });
  }

  // DB 업데이트 및 브로드캐스팅
  const categoryPayloads = validation.data!.categories.map((category) => ({
    title: category.title,
    ideaIds: category.ideaIds,
  }));

  const result = await categorizeService.categorizeAndBroadcast(issueId, categoryPayloads);

  return NextResponse.json(result);
}
