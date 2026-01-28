import { GET, DELETE, PATCH } from '@/app/api/issues/[issueId]/ideas/[ideaId]/route';
import { getServerSession } from 'next-auth';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import {
  createMockSession,
  createMockGetRequest,
  createMockParams,
  createMockRequest,
  expectErrorResponse,
  expectSuccessResponse,
  setupAuthMock,
} from '@test/utils/api-test-helpers';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: () => ({}),
}));
jest.mock('@/lib/repositories/idea.repository');
jest.mock('@/lib/repositories/issue-member.repository');
jest.mock('@/lib/utils/cookie');
jest.mock('@/lib/sse/sse-service');

const mockedFindById = ideaRepository.findById as jest.MockedFunction<typeof ideaRepository.findById>;
const mockedFindMyVote = ideaRepository.findMyVote as jest.MockedFunction<
  typeof ideaRepository.findMyVote
>;
const mockedSoftDelete = ideaRepository.softDelete as jest.MockedFunction<typeof ideaRepository.softDelete>;
const mockedUpdate = ideaRepository.update as jest.MockedFunction<typeof ideaRepository.update>;
const mockedFindMemberByUserId = issueMemberRepository.findMemberByUserId as jest.MockedFunction<
  typeof issueMemberRepository.findMemberByUserId
>;
const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('GET /api/issues/[issueId]/ideas/[ideaId]', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMock(mockedGetServerSession, createMockSession('user-1'));
  });

  it('성공적으로 아이디어를 조회한다', async () => {
    const mockIdea = {
      id: ideaId,
      content: 'Test Idea',
      user: { id: 'user-1' },
      comments: [],
      agreeCount: 5,
      disagreeCount: 2,
    };

    mockedFindById.mockResolvedValue(mockIdea as any);
    mockedFindMyVote.mockResolvedValue(null);
    mockedFindMemberByUserId.mockResolvedValue({ nickname: '사용자1' } as any);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.id).toBe(ideaId);
    expect(data.content).toBe('Test Idea');
  });

  it('존재하지 않는 아이디어를 조회하면 404 에러를 반환한다', async () => {
    mockedFindById.mockResolvedValue(null);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 404, 'IDEA_NOT_FOUND');
  });
});

describe('DELETE /api/issues/[issueId]/ideas/[ideaId]', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMock(mockedGetServerSession, createMockSession('user-1'));
  });

  it('ideaId가 없으면 400 에러를 반환한다', async () => {
    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId: '' });

    const response = await DELETE(req, params);
    await expectErrorResponse(response, 400, 'IDEA_ID_REQUIRED');
  });

  it('성공적으로 아이디어를 삭제한다', async () => {
    const mockIdea = {
      id: ideaId,
      content: 'Test Idea',
      userId: 'user-1',
      issueId,
      categoryId: null,
      positionX: null,
      positionY: null,
      agreeCount: 0,
      disagreeCount: 0,
      isSelected: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    };

    mockedSoftDelete.mockResolvedValue(mockIdea as any);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId });

    const response = await DELETE(req, params);
    await expectSuccessResponse(response, 200);

    expect(mockedSoftDelete).toHaveBeenCalledWith(ideaId);
  });
});

describe('PATCH /api/issues/[issueId]/ideas/[ideaId]', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMock(mockedGetServerSession, createMockSession('user-1'));
  });

  it('ideaId가 없으면 400 에러를 반환한다', async () => {
    const req = createMockRequest({ positionX: 100, positionY: 200 });
    const params = createMockParams({ issueId, ideaId: '' });

    const response = await PATCH(req, params);
    await expectErrorResponse(response, 400, 'IDEA_ID_REQUIRED');
  });

  it('성공적으로 아이디어를 수정한다', async () => {
    const mockIdea = { id: ideaId, positionX: 100, positionY: 200 };

    mockedUpdate.mockResolvedValue(mockIdea as any);

    const req = createMockRequest({ ideaId, positionX: 100, positionY: 200, categoryId: 'cat-1' });
    const params = createMockParams({ issueId });

    const response = await PATCH(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.id).toBe(ideaId);
  });
});
