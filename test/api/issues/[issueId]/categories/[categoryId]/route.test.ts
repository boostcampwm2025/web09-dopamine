import { Prisma } from '@prisma/client';
import { PATCH, DELETE } from '@/app/api/issues/[issueId]/categories/[categoryId]/route';
import { categoryRepository } from '@/lib/repositories/category.repository';
import {
  createMockGetRequest,
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
} from '@test/utils/api-test-helpers';

jest.mock('@/lib/repositories/category.repository');
jest.mock('@/lib/sse/sse-service');

const mockedUpdate = categoryRepository.update as jest.MockedFunction<typeof categoryRepository.update>;
const mockedFindByTitle = categoryRepository.findByTitle as jest.MockedFunction<
  typeof categoryRepository.findByTitle
>;
const mockedSoftDelete = categoryRepository.softDelete as jest.MockedFunction<
  typeof categoryRepository.softDelete
>;

describe('PATCH /api/issues/[issueId]/categories/[categoryId]', () => {
  const issueId = 'issue-1';
  const categoryId = 'cat-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 카테고리를 수정한다', async () => {
    const mockCategory = {
      id: categoryId,
      title: 'Updated Category',
      positionX: 150,
      positionY: 250,
    };

    mockedUpdate.mockResolvedValue(mockCategory as any);

    const req = createMockRequest({
      title: 'Updated Category',
      positionX: 150,
      positionY: 250,
    });
    const params = createMockParams({ issueId, categoryId });

    const response = await PATCH(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.title).toBe('Updated Category');
  });

  it('존재하지 않는 카테고리를 수정하면 404 에러를 반환한다', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: 'fake',
    });
    mockedUpdate.mockRejectedValue(error);

    const req = createMockRequest({ title: 'Updated Category' });
    const params = createMockParams({ issueId, categoryId });

    const response = await PATCH(req, params);
    await expectErrorResponse(response, 404, 'CATEGORY_NOT_FOUND');
  });

  it('다른 카테고리가 이미 해당 이름을 사용 중이면 400 에러를 반환한다', async () => {
    mockedFindByTitle.mockResolvedValue({ id: 'other-cat' } as any);

    const req = createMockRequest({ title: 'Duplicate Title' });
    const params = createMockParams({ issueId, categoryId });

    const response = await PATCH(req, params);
    await expectErrorResponse(response, 400, 'CATEGORY_ALREADY_EXISTS');
    expect(mockedFindByTitle).toHaveBeenCalledWith(issueId, 'Duplicate Title');
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it('본인의 기존 이름으로 수정 시에는 중복 에러가 발생하지 않는다', async () => {
    mockedFindByTitle.mockResolvedValue({ id: categoryId } as any);
    mockedUpdate.mockResolvedValue({ id: categoryId, title: 'My Title' } as any);

    const req = createMockRequest({ title: 'My Title' });
    const params = createMockParams({ issueId, categoryId });

    const response = await PATCH(req, params);
    await expectSuccessResponse(response, 200);
    expect(mockedUpdate).toHaveBeenCalled();
  });
});

describe('DELETE /api/issues/[issueId]/categories/[categoryId]', () => {
  const issueId = 'issue-1';
  const categoryId = 'cat-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('성공적으로 카테고리를 삭제한다', async () => {
    const mockCategory = {
      id: categoryId,
      title: 'Test Category',
      issueId,
      deletedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      positionX: null,
      positionY: null,
      width: null,
      height: null,
    };

    mockedSoftDelete.mockResolvedValue(mockCategory as any);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, categoryId });

    const response = await DELETE(req, params);
    await expectSuccessResponse(response, 200);

    expect(mockedSoftDelete).toHaveBeenCalledWith(categoryId);
  });

  it('존재하지 않는 카테고리를 삭제하면 404 에러를 반환한다', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: 'fake',
    });
    mockedSoftDelete.mockRejectedValue(error);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, categoryId });

    const response = await DELETE(req, params);
    await expectErrorResponse(response, 404, 'CATEGORY_NOT_FOUND');
  });
});
