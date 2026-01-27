import { prisma } from '@/lib/prisma';
import { categoryRepository } from '@/lib/repositories/category.repository';
import { PrismaTransaction } from '@/types/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockedCategory = prisma.category as jest.Mocked<typeof prisma.category>;

describe('Category Repository 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('이슈 ID로 삭제되지 않은 카테고리를 생성일 순으로 조회한다', async () => {
    const issueId = 'issue-1';
    const mockCategories = [{ id: 'category-1' }, { id: 'category-2' }];
    mockedCategory.findMany.mockResolvedValue(mockCategories as any);

    const result = await categoryRepository.findByIssueId(issueId);

    expect(mockedCategory.findMany).toHaveBeenCalledWith({
      where: {
        issueId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });
    expect(result).toEqual(mockCategories);
  });

  it('이슈 ID로 카테고리를 논리 삭제(Soft Delete)한다', async () => {
    const issueId = 'issue-1';
    const now = new Date('2024-01-01T00:00:00Z');
    // 트렌잭션 모킹
    const mockTx = {
      category: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    } as unknown as PrismaTransaction;

    await categoryRepository.softDeleteByIssueId(issueId, now, mockTx);

    expect(mockTx.category.updateMany).toHaveBeenCalledWith({
      where: { issueId, deletedAt: null },
      data: { deletedAt: now },
    });
  });

  it('논리 삭제를 기본 파라미터로 호출하면 기본 prisma와 현재 시각이 사용된다', async () => {
    jest.useFakeTimers();
    const now = new Date('2024-01-02T00:00:00Z');
    jest.setSystemTime(now);
    mockedCategory.updateMany.mockResolvedValue({ count: 1 } as any);

    await categoryRepository.softDeleteByIssueId('issue-1');

    const call = mockedCategory.updateMany.mock.calls[0][0];
    expect(call.where).toEqual({ issueId: 'issue-1', deletedAt: null });
    expect(call.data.deletedAt).toEqual(now);
    jest.useRealTimers();
  });

  it('이슈에 속한 카테고리를 일괄 생성하고 기본 좌표를 부여한다', async () => {
    const issueId = 'issue-1';
    const categories = [{ title: 'A' }, { title: 'B' }];
    const mockTx = {
      category: {
        create: jest
          .fn()
          .mockResolvedValueOnce({ id: 'category-1' })
          .mockResolvedValueOnce({ id: 'category-2' }),
      },
    } as unknown as PrismaTransaction;

    const result = await categoryRepository.createManyForIssue(issueId, categories, mockTx);

    expect(mockTx.category.create).toHaveBeenCalledWith({
      data: {
        issueId,
        title: 'A',
        positionX: 100,
        positionY: 100,
      },
    });
    expect(mockTx.category.create).toHaveBeenCalledWith({
      data: {
        issueId,
        title: 'B',
        positionX: 700,
        positionY: 100,
      },
    });
    expect(result).toHaveLength(2);
  });

  it('카테고리 일괄 생성은 트랜잭션 미전달 시 기본 prisma로 처리된다', async () => {
    mockedCategory.create.mockResolvedValue({ id: 'category-1' } as any);

    await categoryRepository.createManyForIssue('issue-1', [{ title: 'A' }]);

    expect(mockedCategory.create).toHaveBeenCalledWith({
      data: {
        issueId: 'issue-1',
        title: 'A',
        positionX: 100,
        positionY: 100,
      },
    });
  });

  it('카테고리를 생성할 때 전달된 좌표/크기를 저장한다', async () => {
    const data = {
      issueId: 'issue-1',
      title: '카테고리',
      positionX: 10,
      positionY: 20,
      width: 300,
      height: 200,
    };
    mockedCategory.create.mockResolvedValue({ id: 'category-1' } as any);

    await categoryRepository.create(data);

    expect(mockedCategory.create).toHaveBeenCalledWith({
      data: {
        issueId: data.issueId,
        title: data.title,
        positionX: data.positionX,
        positionY: data.positionY,
        width: data.width,
        height: data.height,
      },
    });
  });

  it('카테고리를 업데이트할 때 지정된 필드만 수정한다', async () => {
    const categoryId = 'category-1';
    const data = { title: '변경', positionX: 50, positionY: 60 };
    mockedCategory.update.mockResolvedValue({ id: categoryId } as any);

    await categoryRepository.update(categoryId, data);

    expect(mockedCategory.update).toHaveBeenCalledWith({
      where: { id: categoryId },
      data: {
        title: data.title,
        positionX: data.positionX,
        positionY: data.positionY,
        width: undefined,
        height: undefined,
      },
    });
  });

  it('카테고리를 Soft Delete 처리한다', async () => {
    const categoryId = 'category-1';
    mockedCategory.update.mockResolvedValue({ id: categoryId } as any);

    await categoryRepository.softDelete(categoryId);

    const call = mockedCategory.update.mock.calls[0][0];
    expect(call.where).toEqual({ id: categoryId });
    expect(call.data.deletedAt).toBeInstanceOf(Date);
  });
});
