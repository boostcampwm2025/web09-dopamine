/**
 * 리포트 관련 API 함수
 */
import getAPIResponseData from '@/lib/utils/api-response';

export interface WordCloudItem {
  word: string;
  count: number;
}

export interface WordCloudResponse {
  wordClouds: Array<{
    id: string;
    word: string;
    count: number | null;
  }>;
}

/**
 * 리포트의 워드클라우드 데이터를 조회합니다
 */
export async function getWordClouds(issueId: string): Promise<WordCloudItem[]> {
  try {
    const data = await getAPIResponseData<WordCloudResponse>({
      url: `/api/issues/${issueId}/reports/word-cloud`,
      method: 'GET',
    });

    return data.wordClouds.map((item) => ({
      word: item.word,
      count: item.count ?? 0,
    }));
  } catch (error) {
    console.error('워드클라우드 조회 실패:', error);
    return [];
  }
}

/**
 * 리포트의 워드클라우드를 생성합니다
 */
export async function generateWordCloud(issueId: string): Promise<WordCloudItem[]> {
  try {
    const data = await getAPIResponseData<{ success: boolean; wordClouds: WordCloudItem[] }>({
      url: `/api/issues/${issueId}/reports/word-cloud`,
      method: 'POST',
    });

    return data.wordClouds || [];
  } catch (error) {
    console.error('워드클라우드 생성 실패:', error);
    return [];
  }
}
