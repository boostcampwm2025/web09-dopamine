import { NextRequest } from 'next/server';
import { GET } from '@/app/api/issues/[id]/members/[searchTerm]/route';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';

jest.mock('@/lib/repositories/issue-member.repository');

const mockedRepository = issueMemberRepository as jest.Mocked<typeof issueMemberRepository>;

describe('GET /api/issues/[id]/members/[searchTerm] API 테스트', () => {
  // 공통 변수 추출
  const issueId = 'issue-123';
  const searchTerm = 'kim';
  const mockMembers = [
    { id: 'member-1', user: { id: 'user-1', displayName: 'Kim' } },
  ];
  const mockError = new Error('db error');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockParams = (id: string, term: string) => {
    return {
      params: Promise.resolve({ id, searchTerm: term }),
    };
  };

  it('검색어와 일치하는 멤버 목록을 반환해야 한다', async () => {
    // Repository 모킹
    mockedRepository.findMembersByNickname.mockResolvedValue(mockMembers as any);

    const response = await GET({} as NextRequest, createMockParams(issueId, searchTerm));
    const data = await response.json();

    // 검증
    expect(response.status).toBe(200);
    expect(mockedRepository.findMembersByNickname).toHaveBeenCalledWith(issueId, searchTerm);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockMembers);
  });

  it('레포지토리에서 에러 발생 시 500 상태 코드를 반환해야 한다', async () => {
    // 에러 상황 모킹
    mockedRepository.findMembersByNickname.mockRejectedValue(mockError);

    const response = await GET({} as NextRequest, createMockParams(issueId, searchTerm));
    const data = await response.json();

    // 검증
    expect(response.status).toBe(500);
    expect(data.error.code).toBe('MEMBER_FETCH_FAILED');
  });
});
