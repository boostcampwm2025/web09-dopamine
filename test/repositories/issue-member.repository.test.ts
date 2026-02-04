import { IssueRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { PrismaTransaction } from '@/types/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    issueMember: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
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
    const issueId = 'issue-1';

    // 실행
    await issueMemberRepository.findMembersByIssueId(issueId);

    // 검증
    expect(mockedIssueMember.findMany).toHaveBeenCalledWith({
      where: {
        issueId: issueId,
        deletedAt: null,
      },
      select: {
        userId: true,
        nickname: true,
        role: true,
        // 💡 추가된 부분: 유저의 프로필 이미지를 가져오는 select 문 반영
        user: {
          select: {
            image: true,
          },
        },
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

  it('이슈 멤버의 닉네임을 수정한다', async () => {
    // 역할: 닉네임 수정 기능이 예상대로 DB 업데이트를 수행하는지 검증한다.
    // 먼저 멤버가 존재하는지 확인하는 로직이 있으므로 findFirst 모킹 필요
    mockedIssueMember.findFirst.mockResolvedValue({ role: IssueRole.MEMBER } as any);
    mockedIssueMember.updateMany.mockResolvedValue({ count: 1 });

    await issueMemberRepository.updateNickname('issue-1', 'user-1', 'New Nickname');

    expect(mockedIssueMember.updateMany).toHaveBeenCalledWith({
      where: {
        issueId: 'issue-1',
        userId: 'user-1',
      },
      data: {
        nickname: 'New Nickname',
      },
    });
  });
});
