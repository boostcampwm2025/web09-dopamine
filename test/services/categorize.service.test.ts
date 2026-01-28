import { SSE_EVENT_TYPES } from '@/constants/sse-events';
import { prisma } from '@/lib/prisma';
import { categoryRepository } from '@/lib/repositories/category.repository';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { categorizeService } from '@/lib/services/categorize.service';
import { broadcast } from '@/lib/sse/sse-service';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/repositories/category.repository');
jest.mock('@/lib/repositories/idea.repository');
jest.mock('@/lib/sse/sse-service', () => ({
  broadcast: jest.fn(),
}));

const mockedTransaction = prisma.$transaction as jest.Mock;
const mockedCategoryRepository = categoryRepository as jest.Mocked<typeof categoryRepository>;
const mockedIdeaRepository = ideaRepository as jest.Mocked<typeof ideaRepository>;
const mockedBroadcast = broadcast as jest.MockedFunction<typeof broadcast>;

describe('categorizeService.categorizeAndBroadcast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupTransaction = () => {
    const tx = { id: 'tx' } as any;
    mockedTransaction.mockImplementation(async (callback: (tx: any) => any) => callback(tx));
    return tx;
  };

  it('카테고리-아이디어 매핑 후 브로드캐스트한다', async () => {
    const tx = setupTransaction();
    const issueId = 'issue-1';
    const payloads = [
      { title: 'Category A', ideaIds: ['idea-1', 'idea-2'] },
      { title: 'Category B', ideaIds: ['idea-3'] },
    ];

    // 1) 기존 카테고리 soft delete + 아이디어 카테고리 리셋
    mockedCategoryRepository.softDeleteByIssueId.mockResolvedValue({ count: 2 } as any);
    mockedIdeaRepository.resetCategoriesByIssueId.mockResolvedValue({ count: 3 } as any);
    // 2) 새 카테고리 생성
    mockedCategoryRepository.createManyForIssue.mockResolvedValue([
      { id: 'cat-1' },
      { id: 'cat-2' },
    ] as any);
    // 3) 아이디어를 새 카테고리에 재할당
    mockedIdeaRepository.updateManyCategoriesByIds.mockResolvedValue({ count: 1 } as any);
    // 4) 미분류 아이디어 조회
    mockedIdeaRepository.findUncategorizedByIssueId.mockResolvedValue([] as any);

    const result = await categorizeService.categorizeAndBroadcast(issueId, payloads);

    // 1) 기존 카테고리/아이디어 상태 초기화
    expect(mockedCategoryRepository.softDeleteByIssueId).toHaveBeenCalledWith(
      issueId,
      expect.any(Date),
      tx,
    );
    expect(mockedIdeaRepository.resetCategoriesByIssueId).toHaveBeenCalledWith(issueId, tx);
    // 2) 카테고리 생성
    expect(mockedCategoryRepository.createManyForIssue).toHaveBeenCalledWith(issueId, payloads, tx);
    // 3) 아이디어 재할당(카테고리별 묶음 업데이트)
    expect(mockedIdeaRepository.updateManyCategoriesByIds).toHaveBeenCalledTimes(2);
    expect(mockedIdeaRepository.updateManyCategoriesByIds).toHaveBeenCalledWith(
      ['idea-1', 'idea-2'],
      issueId,
      'cat-1',
      tx,
    );
    expect(mockedIdeaRepository.updateManyCategoriesByIds).toHaveBeenCalledWith(
      ['idea-3'],
      issueId,
      'cat-2',
      tx,
    );
    // 4) 미분류 아이디어가 없으므로 "기타" 카테고리 생성 없음
    expect(mockedCategoryRepository.create).not.toHaveBeenCalled();

    // 5) 결과 매핑 확인
    expect(result).toEqual({
      categories: [{ id: 'cat-1' }, { id: 'cat-2' }],
      ideaCategoryMap: {
        'idea-1': 'cat-1',
        'idea-2': 'cat-1',
        'idea-3': 'cat-2',
      },
    });

    // 6) 브로드캐스트 이벤트 확인
    expect(mockedBroadcast).toHaveBeenCalledTimes(2);
    expect(mockedBroadcast).toHaveBeenCalledWith({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.CATEGORY_CREATED,
        data: { categoryIds: ['cat-1', 'cat-2'] },
      },
    });
    expect(mockedBroadcast).toHaveBeenCalledWith({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.IDEA_MOVED,
        data: { ideaIds: ['idea-1', 'idea-2', 'idea-3'] },
      },
    });
  });

  it('남은 아이디어는 미분류 카테고리를 생성한다', async () => {
    const tx = setupTransaction();
    const issueId = 'issue-1';
    const payloads = [
      { title: 'Category A', ideaIds: ['idea-1'] },
      { title: 'Category B', ideaIds: [] },
    ];

    mockedCategoryRepository.softDeleteByIssueId.mockResolvedValue({ count: 2 } as any);
    mockedIdeaRepository.resetCategoriesByIssueId.mockResolvedValue({ count: 3 } as any);
    mockedCategoryRepository.createManyForIssue.mockResolvedValue([
      { id: 'cat-1' },
      { id: 'cat-2' },
    ] as any);
    mockedIdeaRepository.updateManyCategoriesByIds.mockResolvedValue({ count: 1 } as any);
    mockedIdeaRepository.findUncategorizedByIssueId.mockResolvedValue([{ id: 'idea-2' }] as any);
    mockedCategoryRepository.create.mockResolvedValue({ id: 'cat-uncat' } as any);

    const result = await categorizeService.categorizeAndBroadcast(issueId, payloads);

    expect(mockedCategoryRepository.create).toHaveBeenCalledWith(
      {
        issueId,
        title: '기타',
        positionX: 1300,
        positionY: 100,
      },
      tx,
    );
    expect(mockedIdeaRepository.updateManyCategoriesByIds).toHaveBeenCalledWith(
      ['idea-2'],
      issueId,
      'cat-uncat',
      tx,
    );
    expect(result.categories).toEqual([{ id: 'cat-1' }, { id: 'cat-2' }, { id: 'cat-uncat' }]);
    expect(result.ideaCategoryMap).toEqual({
      'idea-1': 'cat-1',
      'idea-2': 'cat-uncat',
    });
    expect(mockedBroadcast).toHaveBeenCalledWith({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.CATEGORY_CREATED,
        data: { categoryIds: ['cat-1', 'cat-2', 'cat-uncat'] },
      },
    });
    expect(mockedBroadcast).toHaveBeenCalledWith({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.IDEA_MOVED,
        data: { ideaIds: ['idea-1', 'idea-2'] },
      },
    });
  });
});
