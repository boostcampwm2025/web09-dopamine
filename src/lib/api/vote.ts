/**
 * 특정 아이디어에 대한 사용자의 투표(찬성/반대/취소)를 서버에 업데이트 요청하는 함수
 * @param issueId - 아이디어가 속한 이슈의 고유 ID
 * @param ideaId - 투표 대상 아이디어의 고유 ID
 * @param payload - 투표에 필요한 데이터 (사용자 ID 및 투표 타입)
 * @param payload.type - 'agree'(찬성), 'disagree'(반대), null(투표 취소) 중 하나
 * @returns 업데이트가 반영된 최신 투표 현황 (찬성 수, 반대 수, 사용자의 현재 투표 상태)
 */
export async function updateIdeaVote(
  issueId: string,
  ideaId: string,
  payload: {
    userId: string;
    type: 'agree' | 'disagree' | null;
  },
): Promise<{
  agreeCount: number;
  disagreeCount: number;
  userVote: 'agree' | 'disagree' | null;
}> {
  // 서버의 API 엔드포인트로 PUT 요청을 보냄
  const response = await fetch(`/api/issues/${issueId}/idea/${ideaId}/vote`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  // 서버 응답이 성공(200~299)이 아닌 경우 에러를 던져 호출부(catch문)에서 처리하도록 함
  if (!response.ok) {
    throw new Error('Vote update failed.');
  }

  // 서버에서 반환한 최신 투표 데이터(JSON)를 파싱하여 반환
  return response.json();
}