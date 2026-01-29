import { prisma } from '@/lib/prisma';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { PrismaTransaction } from '@/types/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    idea: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    issueMember: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

const mockedIdea = prisma.idea as jest.Mocked<typeof prisma.idea>;
const mockedIssueMember = prisma.issueMember as jest.Mocked<typeof prisma.issueMember>;

const ideaUserSelect = {
  select: {
    id: true,
    name: true,
    image: true,
  },
};

const ideaCategorySelect = {
  select: {
    id: true,
    title: true,
  },
};

describe('Idea Repository 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('이슈 ID로 아이디어를 조회하며 관련 데이터까지 함께 가져온다', async () => {
    // 역할: 목록 화면에 필요한 데이터(닉네임, 댓글 수, myVote 등)를 가공해 반환한다.
    const issueId = 'issue-1';
    const mockIdeas = [
      {
        id: 'idea-1',
        content: '내용',
        userId: 'user-1',
        agreeCount: 1,
        disagreeCount: 0,
        positionX: 10,
        positionY: 20,
        createdAt: new Date('2024-01-01'),
        category: { id: 'category-1', title: '카테고리' },
        comments: [{ id: 'comment-1' }],
        votes: [{ type: 'AGREE' }],
      },
    ];
    const mockIssueMembers = [{ userId: 'user-1', nickname: 'nickname-1' }];
    mockedIdea.findMany.mockResolvedValue(mockIdeas as any);
    mockedIssueMember.findMany.mockResolvedValue(mockIssueMembers as any);

    const result = await ideaRepository.findByIssueId(issueId);

    expect(mockedIdea.findMany).toHaveBeenCalledWith({
      where: {
        issueId,
        deletedAt: null,
      },
      select: {
        id: true,
        content: true,
        userId: true,
        agreeCount: true,
        disagreeCount: true,
        positionX: true,
        positionY: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            title: true,
          },
        },
        comments: {
          where: { deletedAt: null },
          select: { id: true },
        },
        votes: {
          where: {
            deletedAt: null,
          },
          select: {
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(mockedIssueMember.findMany).toHaveBeenCalledWith({
      where: {
        issueId,
        deletedAt: null,
      },
      select: {
        userId: true,
        nickname: true,
      },
    });
    expect(result).toEqual([
      {
        id: 'idea-1',
        content: '내용',
        userId: 'user-1',
        categoryId: 'category-1',
        nickname: 'nickname-1',
        agreeCount: 1,
        disagreeCount: 0,
        commentCount: 1,
        positionX: 10,
        positionY: 20,
        myVote: 'AGREE',
        createdAt: new Date('2024-01-01'),
      },
    ]);
  });

  it('이슈 ID로 아이디어의 id/content만 조회한다', async () => {
    // 역할: 워드클라우드 등 최소 데이터 조회가 정확히 동작하는지 확인한다.
    const issueId = 'issue-1';
    const mockIdeas = [{ id: 'idea-1', content: '내용' }];
    mockedIdea.findMany.mockResolvedValue(mockIdeas as any);

    const result = await ideaRepository.findIdAndContentByIssueId(issueId);

    expect(mockedIdea.findMany).toHaveBeenCalledWith({
      where: {
        issueId,
        deletedAt: null,
      },
      select: {
        id: true,
        content: true,
      },
    });
    expect(result).toEqual(mockIdeas);
  });

  it('이슈의 모든 아이디어 카테고리를 초기화한다', async () => {
    // 역할: 분류 초기화 시 모든 아이디어가 카테고리 없이 복귀하는지 검증한다.
    const issueId = 'issue-1';
    const mockTx = {
      idea: {
        updateMany: jest.fn().mockResolvedValue({ count: 3 }),
      },
    } as unknown as PrismaTransaction;

    await ideaRepository.resetCategoriesByIssueId(issueId, mockTx);

    expect(mockTx.idea.updateMany).toHaveBeenCalledWith({
      where: { issueId },
      data: { categoryId: null, positionX: null, positionY: null },
    });
  });

  it('카테고리 초기화는 트랜잭션 미전달 시 기본 prisma로 처리된다', async () => {
    // 역할: 기본 클라이언트 경로에서도 일괄 초기화가 정상 동작하는지 보장한다.
    mockedIdea.updateMany.mockResolvedValue({ count: 2 } as any);

    await ideaRepository.resetCategoriesByIssueId('issue-1');

    expect(mockedIdea.updateMany).toHaveBeenCalledWith({
      where: { issueId: 'issue-1' },
      data: { categoryId: null, positionX: null, positionY: null },
    });
  });

  it('아이디어 생성 시 작성자/카테고리 정보를 함께 반환한다', async () => {
    // 역할: 생성 응답으로 UI에 필요한 작성자/카테고리 정보를 즉시 제공한다.
    const data = {
      issueId: 'issue-1',
      userId: 'user-1',
      content: '새 아이디어',
      positionX: 10,
      positionY: 20,
      categoryId: 'category-1',
    };
    const mockCreatedIdea = { id: 'idea-1', issueId: 'issue-1', userId: 'user-1' };
    const mockIssueMember = { nickname: 'nickname-1' };
    mockedIdea.create.mockResolvedValue(mockCreatedIdea as any);
    mockedIssueMember.findFirst.mockResolvedValue(mockIssueMember as any);

    const result = await ideaRepository.create(data);

    expect(mockedIdea.create).toHaveBeenCalledWith({
      data: {
        issueId: data.issueId,
        userId: data.userId,
        content: data.content,
        positionX: data.positionX,
        positionY: data.positionY,
        categoryId: data.categoryId,
      },
      include: {
        user: ideaUserSelect,
        category: ideaCategorySelect,
      },
    });
    expect(mockedIssueMember.findFirst).toHaveBeenCalledWith({
      where: {
        issueId: data.issueId,
        userId: data.userId,
        deletedAt: null,
      },
      select: {
        nickname: true,
      },
    });
    expect(result).toEqual({
      ...mockCreatedIdea,
      issueMember: { nickname: 'nickname-1' },
    });
  });

  it('아이디어를 Soft Delete 처리한다', async () => {
    // 역할: 삭제 요청 시 실제 삭제 대신 삭제 시간만 남겨 복구 가능성을 유지한다.
    const ideaId = 'idea-1';
    mockedIdea.update.mockResolvedValue({ id: ideaId } as any);

    await ideaRepository.softDelete(ideaId);

    const call = mockedIdea.update.mock.calls[0][0];
    expect(call.where).toEqual({ id: ideaId });
    expect(call.data.deletedAt).toBeInstanceOf(Date);
  });

  it('아이디어 좌표/카테고리를 업데이트하고 관련 정보를 함께 반환한다', async () => {
    // 역할: 드래그/분류 변경 후 최신 데이터가 반환되는지 확인한다.
    const ideaId = 'idea-1';
    const data = { positionX: 100, positionY: 200, categoryId: 'category-1' };
    const mockUpdatedIdea = { id: ideaId, issueId: 'issue-1', userId: 'user-1' };
    const mockIssueMember = { nickname: 'nickname-1' };
    mockedIdea.update.mockResolvedValue(mockUpdatedIdea as any);
    mockedIssueMember.findFirst.mockResolvedValue(mockIssueMember as any);

    const result = await ideaRepository.update(ideaId, data);

    expect(mockedIdea.update).toHaveBeenCalledWith({
      where: { id: ideaId },
      data: {
        positionX: data.positionX,
        positionY: data.positionY,
        categoryId: data.categoryId,
      },
      include: {
        user: ideaUserSelect,
        category: ideaCategorySelect,
      },
    });
    expect(mockedIssueMember.findFirst).toHaveBeenCalledWith({
      where: {
        issueId: 'issue-1',
        userId: 'user-1',
        deletedAt: null,
      },
      select: {
        nickname: true,
      },
    });
    expect(result).toEqual({
      ...mockUpdatedIdea,
      issueMember: { nickname: 'nickname-1' },
    });
  });

  it('이슈 ID로 아이디어 ID 목록만 조회한다', async () => {
    // 역할: 대량 업데이트 대상 선별에 필요한 최소 데이터만 받는지 확인한다.
    const issueId = 'issue-1';
    const mockTx = {
      idea: {
        findMany: jest.fn().mockResolvedValue([{ id: 'idea-1' }]),
      },
    } as unknown as PrismaTransaction;

    await ideaRepository.findManyByIssueId(issueId, mockTx);

    expect(mockTx.idea.findMany).toHaveBeenCalledWith({
      where: { issueId, deletedAt: null },
      select: { id: true },
    });
  });

  it('아이디어 ID 목록 조회는 트랜잭션 미전달 시 기본 prisma를 사용한다', async () => {
    // 역할: 기본 경로에서도 Soft Delete 필터가 유지되는지 확인한다.
    mockedIdea.findMany.mockResolvedValue([{ id: 'idea-1' }] as any);

    await ideaRepository.findManyByIssueId('issue-1');

    expect(mockedIdea.findMany).toHaveBeenCalledWith({
      where: { issueId: 'issue-1', deletedAt: null },
      select: { id: true },
    });
  });

  it('미분류 아이디어 ID 목록만 조회한다', async () => {
    // 역할: 카테고리 재분류 시 미분류 대상만 빠르게 선별한다.
    const issueId = 'issue-1';
    const mockTx = {
      idea: {
        findMany: jest.fn().mockResolvedValue([{ id: 'idea-1' }]),
      },
    } as unknown as PrismaTransaction;

    await ideaRepository.findUncategorizedByIssueId(issueId, mockTx);

    expect(mockTx.idea.findMany).toHaveBeenCalledWith({
      where: { issueId, deletedAt: null, categoryId: null },
      select: { id: true },
    });
  });

  it('미분류 아이디어 조회는 트랜잭션 미전달 시 기본 prisma를 사용한다', async () => {
    // 역할: 기본 경로에서도 미분류 필터가 유지되는지 확인한다.
    mockedIdea.findMany.mockResolvedValue([{ id: 'idea-1' }] as any);

    await ideaRepository.findUncategorizedByIssueId('issue-1');

    expect(mockedIdea.findMany).toHaveBeenCalledWith({
      where: { issueId: 'issue-1', deletedAt: null, categoryId: null },
      select: { id: true },
    });
  });

  it('여러 아이디어의 카테고리를 한 번에 갱신한다', async () => {
    // 역할: 다중 선택 이동 시 원자적으로 카테고리가 변경되는지 보장한다.
    const mockTx = {
      idea: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    } as unknown as PrismaTransaction;

    await ideaRepository.updateManyCategoriesByIds(
      ['idea-1', 'idea-2'],
      'issue-1',
      'category-1',
      mockTx,
    );

    expect(mockTx.idea.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['idea-1', 'idea-2'] }, issueId: 'issue-1' },
      data: { categoryId: 'category-1', positionX: null, positionY: null },
    });
  });

  it('카테고리 일괄 갱신은 트랜잭션 미전달 시 기본 prisma로 처리된다', async () => {
    // 역할: 기본 클라이언트에서도 대량 업데이트가 동일하게 수행되는지 확인한다.
    mockedIdea.updateMany.mockResolvedValue({ count: 2 } as any);

    await ideaRepository.updateManyCategoriesByIds(
      ['idea-1', 'idea-2'],
      'issue-1',
      'category-1',
    );

    expect(mockedIdea.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['idea-1', 'idea-2'] }, issueId: 'issue-1' },
      data: { categoryId: 'category-1', positionX: null, positionY: null },
    });
  });
});
