import { NextRequest } from 'next/server';
import { GET } from '@/app/api/issues/[id]/members/search/[searchTerm]/route';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';

jest.mock('@/lib/repositories/issue-member.repository');

const mockedRepository = issueMemberRepository as jest.Mocked<typeof issueMemberRepository>;

describe('GET /api/issues/[id]/members/search/[searchTerm]', () => {
  const issueId = 'issue-123';
  const searchTerm = 'kim';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockParams = (id: string, term: string) => {
    return {
      params: Promise.resolve({ id, searchTerm: term }),
    };
  };

  it('returns members matching the search term', async () => {
    const mockMembers = [{ id: 'member-1', user: { id: 'user-1', displayName: 'Kim' } }];
    mockedRepository.findMembersByNickname.mockResolvedValue(mockMembers as any);

    const response = await GET({} as NextRequest, createMockParams(issueId, searchTerm));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockedRepository.findMembersByNickname).toHaveBeenCalledWith(issueId, searchTerm);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockMembers);
  });

  it('returns 500 when repository throws', async () => {
    mockedRepository.findMembersByNickname.mockRejectedValue(new Error('db error'));

    const response = await GET({} as NextRequest, createMockParams(issueId, searchTerm));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('MEMBER_FETCH_FAILED');
  });
});
