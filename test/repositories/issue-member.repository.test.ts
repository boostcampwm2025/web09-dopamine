import { IssueRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { PrismaTransaction } from '@/types/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    issueMember: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

const mockedIssueMember = prisma.issueMember as jest.Mocked<typeof prisma.issueMember>;

describe('Issue Member Repository 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('이슈 멤버를 기본 역할(MEMBER)로 추가한다', async () => {
    // 역할: 기본 역할 부여가 누락되면 권한 로직이 깨지므로 기본값 적용을 보장한다.
    const mockTx = {
      issueMember: {
        create: jest.fn().mockResolvedValue({ id: 'member-1' }),
      },
    } as unknown as PrismaTransaction;

    await issueMemberRepository.addIssueMember(mockTx, {
      issueId: 'issue-1',
      userId: 'user-1',
      nickname: 'Test User',
      role: IssueRole.OWNER,
    });

    expect(mockTx.issueMember.create).toHaveBeenCalledWith({
      data: {
        issueId: 'issue-1',
        userId: 'user-1',
        nickname: 'Test User',
        role: IssueRole.OWNER,
      },
    });
  });

  it('이슈 ID로 삭제되지 않은 멤버 목록을 조회한다', async () => {
    // 역할: UI 멤버 리스트에 탈퇴/삭제 멤버가 섞이지 않도록 필터링 조건을 검증한다.
    mockedIssueMember.findMany.mockResolvedValue([{ role: IssueRole.MEMBER }] as any);

    await issueMemberRepository.findMembersByIssueId('issue-1');

    expect(mockedIssueMember.findMany).toHaveBeenCalledWith({
      where: {
        issueId: 'issue-1',
        deletedAt: null,
      },
      select: {
        userId: true,
        role: true,
        nickname: true,
      },
    });
  });

  it('유저 ID로 이슈 멤버 정보를 조회한다', async () => {
    // 역할: 권한/역할 확인을 위해 사용자 기준 조회 조건이 정확한지 보장한다.
    mockedIssueMember.findFirst.mockResolvedValue({ role: IssueRole.MEMBER } as any);

    await issueMemberRepository.findMemberByUserId('issue-1', 'user-1');

    expect(mockedIssueMember.findFirst).toHaveBeenCalledWith({
      where: {
        issueId: 'issue-1',
        userId: 'user-1',
        deletedAt: null,
      },
      select: {
        userId: true,
        nickname: true,
        role: true,
      },
    });
  });
});
