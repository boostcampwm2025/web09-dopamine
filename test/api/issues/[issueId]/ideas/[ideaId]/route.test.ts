import { getServerSession } from 'next-auth';
import {
  createMockGetRequest,
  createMockParams,
  createMockRequest,
  createMockSession,
  expectErrorResponse,
  expectSuccessResponse,
  setupAuthMock,
} from '@test/utils/api-test-helpers';
import { DELETE, GET, PATCH } from '@/app/api/issues/[issueId]/ideas/[ideaId]/route';
import { ideaRepository } from '@/lib/repositories/idea.repository';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';

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

const mockedFindById = ideaRepository.findById as jest.MockedFunction<
  typeof ideaRepository.findById
>;
const mockedFindMyVote = ideaRepository.findMyVote as jest.MockedFunction<
  typeof ideaRepository.findMyVote
>;
const mockedSoftDelete = ideaRepository.softDelete as jest.MockedFunction<
  typeof ideaRepository.softDelete
>;
const mockedUpdate = ideaRepository.update as jest.MockedFunction<typeof ideaRepository.update>;
const mockedFindMemberByUserId = issueMemberRepository.findMemberByUserId as jest.MockedFunction<
  typeof issueMemberRepository.findMemberByUserId
>;
const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// Prisma 에러 시뮬레이션을 위한 헬퍼
const createPrismaError = (code: string) => {
  const error = new Error('Prisma Error');
  (error as any).code = code;
  return error;
};

describe('GET /api/issues/[issueId]/ideas/[ideaId]', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMock(mockedGetServerSession, createMockSession('user-1'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('성공적으로 아이디어를 조회한다 (투표 안함, 멤버 정보 있음)', async () => {
    const mockIdea = {
      id: ideaId,
      content: 'Test Idea',
      userId: 'user-1',
      _count: { comments: 5 },
    };

    mockedFindById.mockResolvedValue(mockIdea as any);
    mockedFindMemberByUserId.mockResolvedValue({ nickname: '작성자닉네임' } as any);
    mockedFindMyVote.mockResolvedValue(null);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.id).toBe(ideaId);
    expect(data.issueMember.nickname).toBe('작성자닉네임');
    expect(data.commentCount).toBe(5);
    expect(data.myVote).toBeNull();
  });

  it('성공적으로 아이디어를 조회한다 (이미 투표함)', async () => {
    const mockIdea = {
      id: ideaId,
      userId: 'user-1',
      _count: { comments: 0 },
    };

    mockedFindById.mockResolvedValue(mockIdea as any);
    mockedFindMemberByUserId.mockResolvedValue(null); // 멤버 정보 없을 때도 테스트
    mockedFindMyVote.mockResolvedValue({ type: 'AGREE' } as any); // 투표 정보 있음

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId });

    const response = await GET(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.myVote).toBe('AGREE');
    expect(data.issueMember).toBeNull();
  });

  it('존재하지 않는 아이디어를 조회하면 404 에러를 반환한다', async () => {
    mockedFindById.mockResolvedValue(null);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 404, 'IDEA_NOT_FOUND');
  });

  it('DB 에러 발생 시 500 에러를 반환한다', async () => {
    mockedFindById.mockRejectedValue(new Error('DB Error'));

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId });

    const response = await GET(req, params);
    await expectErrorResponse(response, 500, 'IDEA_DETAIL_FETCH_FAILED');
  });
});

describe('DELETE /api/issues/[issueId]/ideas/[ideaId]', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMock(mockedGetServerSession, createMockSession('user-1'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('ideaId가 없으면 400 에러를 반환한다', async () => {
    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId: '' }); // 빈 문자열

    const response = await DELETE(req, params);
    await expectErrorResponse(response, 400, 'IDEA_ID_REQUIRED');
  });

  it('성공적으로 아이디어를 삭제한다', async () => {
    mockedSoftDelete.mockResolvedValue({ id: ideaId } as any);

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId });

    const response = await DELETE(req, params);
    await expectSuccessResponse(response, 200);

    expect(mockedSoftDelete).toHaveBeenCalledWith(ideaId);
  });

  it('삭제하려는 아이디어가 없으면(P2025) 404 에러를 반환한다', async () => {
    // Prisma P2025 에러 시뮬레이션
    mockedSoftDelete.mockRejectedValue(createPrismaError('P2025'));

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId });

    const response = await DELETE(req, params);
    await expectErrorResponse(response, 404, 'IDEA_NOT_FOUND');
  });

  it('그 외 DB 에러 발생 시 500 에러를 반환한다', async () => {
    mockedSoftDelete.mockRejectedValue(new Error('Unknown DB Error'));

    const req = createMockGetRequest();
    const params = createMockParams({ issueId, ideaId });

    const response = await DELETE(req, params);
    await expectErrorResponse(response, 500, 'IDEA_DELETE_FAILED');
  });
});

describe('PATCH /api/issues/[issueId]/ideas/[ideaId]', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMock(mockedGetServerSession, createMockSession('user-1'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('Body에 ideaId가 없으면 400 에러를 반환한다', async () => {
    // Body에 ideaId 누락
    const req = createMockRequest({ positionX: 100 });
    const params = createMockParams({ issueId }); // URL params에는 있어도 Body 체크함

    const response = await PATCH(req, params);
    await expectErrorResponse(response, 400, 'IDEA_ID_REQUIRED');
  });

  it('성공적으로 아이디어를 수정한다', async () => {
    const mockUpdatedIdea = { id: ideaId, positionX: 100, positionY: 200 };
    mockedUpdate.mockResolvedValue(mockUpdatedIdea as any);

    const req = createMockRequest({
      ideaId,
      positionX: 100,
      positionY: 200,
      categoryId: 'cat-1',
    });
    const params = createMockParams({ issueId });

    const response = await PATCH(req, params);
    const data = await expectSuccessResponse(response, 200);

    expect(data.id).toBe(ideaId);
    expect(mockedUpdate).toHaveBeenCalledWith(ideaId, {
      positionX: 100,
      positionY: 200,
      categoryId: 'cat-1',
    });
  });

  it('수정하려는 아이디어가 없으면(P2025) 404 에러를 반환한다', async () => {
    mockedUpdate.mockRejectedValue(createPrismaError('P2025'));

    const req = createMockRequest({ ideaId });
    const params = createMockParams({ issueId });

    const response = await PATCH(req, params);
    await expectErrorResponse(response, 404, 'IDEA_NOT_FOUND');
  });

  it('그 외 DB 에러 발생 시 500 에러를 반환한다', async () => {
    mockedUpdate.mockRejectedValue(new Error('Unknown DB Error'));

    const req = createMockRequest({ ideaId });
    const params = createMockParams({ issueId });

    const response = await PATCH(req, params);
    await expectErrorResponse(response, 500, 'IDEA_UPDATE_FAILED');
  });
});
