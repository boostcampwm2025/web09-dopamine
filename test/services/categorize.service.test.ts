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

    // 2) 미분류 아이디어 조회 (모든 아이디어가 여기 포함되어야 로직이 정상 동작)
    mockedIdeaRepository.findUncategorizedByIssueId.mockResolvedValue([
      { id: 'idea-1' },
      { id: 'idea-2' },
      { id: 'idea-3' },
    ] as any);

    // 3) 새 카테고리 생성 (인자 확인용)
    mockedCategoryRepository.createManyForIssue.mockResolvedValue([
      { id: 'cat-1', title: 'Category A' },
      { id: 'cat-2', title: 'Category B' },
    ] as any);

    const result = await categorizeService.categorizeAndBroadcast(issueId, payloads);

    // 1) 기존 카테고리/아이디어 상태 초기화
    expect(mockedCategoryRepository.softDeleteByIssueId).toHaveBeenCalledWith(
      issueId,
      expect.any(Date),
      tx,
    );
    expect(mockedIdeaRepository.resetCategoriesByIssueId).toHaveBeenCalledWith(issueId, tx);

    // 2) 카테고리 생성 (payload안에 ideaIds가 잘 들어갔는지 확인)
    expect(mockedCategoryRepository.createManyForIssue).toHaveBeenCalledWith(
      issueId,
      [
        { title: 'Category A', ideaIds: ['idea-1', 'idea-2'] },
        { title: 'Category B', ideaIds: ['idea-3'] },
      ],
      tx,
    );

    // [Deleted] 3) updateManyCategoriesByIds 호출은 제거됨 (create내에서 connect로 처리)
    expect(mockedIdeaRepository.updateManyCategoriesByIds).not.toHaveBeenCalled();

    // 4) 미분류 아이디어가 없으므로 "기타" 카테고리 추가 없음
    expect(mockedCategoryRepository.create).not.toHaveBeenCalled();

    // 5) 결과 매핑 확인
    expect(result).toEqual({
      categories: [
        { id: 'cat-1', title: 'Category A' },
        { id: 'cat-2', title: 'Category B' },
      ],
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

    // [New] 모든 아이디어 리턴 (idea-2가 미분류 상태로 존재)
    mockedIdeaRepository.findUncategorizedByIssueId.mockResolvedValue([
      { id: 'idea-1' },
      { id: 'idea-2' },
    ] as any);

    // AI 결과에 없던 "기타"가 payload에 추가되어 createManyForIssue로 넘어감
    mockedCategoryRepository.createManyForIssue.mockResolvedValue([
      { id: 'cat-1', title: 'Category A' },
      { id: 'cat-uncat', title: '기타' },
      // Category B는 아이디어가 없어서 제거됨
    ] as any);

    const result = await categorizeService.categorizeAndBroadcast(issueId, payloads);

    // createMany 호출 검증 ("기타" 포함, "Category B" 제외)
    expect(mockedCategoryRepository.createManyForIssue).toHaveBeenCalledWith(
      issueId,
      [
        { title: 'Category A', ideaIds: ['idea-1'] },
        { title: '기타', ideaIds: ['idea-2'] },
      ],
      tx,
    );

    // updateMany는 호출되지 않음
    expect(mockedIdeaRepository.updateManyCategoriesByIds).not.toHaveBeenCalled();

    // 단독 create 호출도 없음 (createMany에 포함됨)
    expect(mockedCategoryRepository.create).not.toHaveBeenCalled();

    expect(result.categories).toEqual([
      { id: 'cat-1', title: 'Category A' },
      { id: 'cat-uncat', title: '기타' },
    ]);
    expect(result.ideaCategoryMap).toEqual({
      'idea-1': 'cat-1',
      'idea-2': 'cat-uncat',
    });
    expect(mockedBroadcast).toHaveBeenCalledWith({
      issueId,
      event: {
        type: SSE_EVENT_TYPES.CATEGORY_CREATED,
        data: { categoryIds: ['cat-1', 'cat-uncat'] },
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

  it('중복된 카테고리 제목이 있을 경우 아이디어들을 병합한다', async () => {
    const tx = setupTransaction();
    const issueId = 'issue-1';
    const payloads = [
      { title: 'Category A', ideaIds: ['idea-1'] },
      { title: 'Category A', ideaIds: ['idea-2'] }, // 중복된 제목
      { title: 'Category B', ideaIds: ['idea-3'] },
    ];

    mockedCategoryRepository.softDeleteByIssueId.mockResolvedValue({ count: 0 } as any);
    mockedIdeaRepository.resetCategoriesByIssueId.mockResolvedValue({ count: 3 } as any);

    mockedIdeaRepository.findUncategorizedByIssueId.mockResolvedValue([
      { id: 'idea-1' },
      { id: 'idea-2' },
      { id: 'idea-3' },
    ] as any);

    mockedCategoryRepository.createManyForIssue.mockResolvedValue([
      { id: 'cat-1', title: 'Category A' },
      { id: 'cat-2', title: 'Category B' },
    ] as any);

    const result = await categorizeService.categorizeAndBroadcast(issueId, payloads);

    // Category A가 하나로 합쳐져서 createManyForIssue가 호출되었는지 확인
    expect(mockedCategoryRepository.createManyForIssue).toHaveBeenCalledWith(
      issueId,
      [
        { title: 'Category A', ideaIds: ['idea-1', 'idea-2'] },
        { title: 'Category B', ideaIds: ['idea-3'] },
      ],
      tx,
    );

    expect(mockedIdeaRepository.updateManyCategoriesByIds).not.toHaveBeenCalled();

    expect(result.ideaCategoryMap).toEqual({
      'idea-1': 'cat-1',
      'idea-2': 'cat-1',
      'idea-3': 'cat-2',
    });
  });

  it('AI 결과에 "기타" 카테고리가 포함된 경우 미분류 아이디어를 해당 카테고리에 합친다', async () => {
    const tx = setupTransaction();
    const issueId = 'issue-1';
    const payloads = [
      { title: '기타', ideaIds: ['idea-1'] },
    ];

    mockedCategoryRepository.softDeleteByIssueId.mockResolvedValue({ count: 0 } as any);
    mockedIdeaRepository.resetCategoriesByIssueId.mockResolvedValue({ count: 2 } as any);

    mockedIdeaRepository.findUncategorizedByIssueId.mockResolvedValue([
      { id: 'idea-1' },
      { id: 'idea-2' }, // 미분류
    ] as any);

    mockedCategoryRepository.createManyForIssue.mockResolvedValue([
      { id: 'cat-other-ai', title: '기타' },
    ] as any);

    const result = await categorizeService.categorizeAndBroadcast(issueId, payloads);

    expect(mockedCategoryRepository.create).not.toHaveBeenCalled();

    // AI가 생성한 "기타" 카테고리에 미분류 아이디어(idea-2)가 병합되어 넘어갔는지 확인
    expect(mockedCategoryRepository.createManyForIssue).toHaveBeenCalledWith(
      issueId,
      [
        { title: '기타', ideaIds: ['idea-1', 'idea-2'] },
      ],
      tx,
    );

    expect(mockedIdeaRepository.updateManyCategoriesByIds).not.toHaveBeenCalled();

    expect(result.categories).toHaveLength(1);
    expect(result.ideaCategoryMap).toEqual({
      'idea-1': 'cat-other-ai',
      'idea-2': 'cat-other-ai',
    });
  });
  it('아이디어가 없는 카테고리는 삭제되고 결과에서 제외된다', async () => {
    const tx = setupTransaction();
    const issueId = 'issue-1';
    const payloads = [
      { title: 'Category A', ideaIds: ['idea-1'] },
      { title: 'Empty Category', ideaIds: [] },
    ];

    mockedCategoryRepository.softDeleteByIssueId.mockResolvedValue({ count: 0 } as any);
    mockedIdeaRepository.resetCategoriesByIssueId.mockResolvedValue({ count: 1 } as any);

    mockedIdeaRepository.findUncategorizedByIssueId.mockResolvedValue([
      { id: 'idea-1' },
    ] as any);

    // createManyForIssue returns ONLY non-empty categories
    mockedCategoryRepository.createManyForIssue.mockResolvedValue([
      { id: 'cat-1', title: 'Category A' },
    ] as any);

    const result = await categorizeService.categorizeAndBroadcast(issueId, payloads);

    // createManyForIssue에 Empty Category가 필터링되어 넘어가지 않았는지 확인
    expect(mockedCategoryRepository.createManyForIssue).toHaveBeenCalledWith(
      issueId,
      [
        { title: 'Category A', ideaIds: ['idea-1'] },
      ],
      tx,
    );

    // softDelete는 호출되지 않음 (생성 자체를 안함)
    expect(mockedCategoryRepository.softDelete).not.toHaveBeenCalled();

    // Assert that the result only contains the non-empty category
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].id).toBe('cat-1');
    expect(result.categories.find((c: any) => c.title === 'Empty Category')).toBeUndefined();

    // Assert expectations for idea mapping
    expect(result.ideaCategoryMap).toEqual({
      'idea-1': 'cat-1',
    });
  });
});
