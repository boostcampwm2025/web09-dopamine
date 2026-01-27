import { prisma } from '@/lib/prisma';
import { createAnonymousUser, findUserById } from '@/lib/repositories/user.repository';
import { PrismaTransaction } from '@/types/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const mockedUser = prisma.user as jest.Mocked<typeof prisma.user>;

describe('User Repository 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('익명 유저를 트랜잭션으로 생성한다', async () => {
    // 역할: 익명 사용자 생성이 트랜잭션 내에서 안전하게 처리되는지 확인한다.
    const mockTx = {
      user: {
        create: jest.fn().mockResolvedValue({ id: 'user-1' }),
      },
    } as unknown as PrismaTransaction;

    await createAnonymousUser(mockTx, '익명');

    expect(mockTx.user.create).toHaveBeenCalledWith({
      data: { displayName: '익명', provider: null },
    });
  });

  it('유저 ID로 이메일만 조회한다(기본 prisma 사용)', async () => {
    // 역할: 민감 정보 과다 노출을 막기 위해 select 범위를 고정한다.
    mockedUser.findUnique.mockResolvedValue({ email: 'test@example.com' } as any);

    await findUserById('user-1');

    expect(mockedUser.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { email: true },
    });
  });

  it('트랜잭션이 주어지면 해당 클라이언트로 조회한다', async () => {
    // 역할: 트랜잭션 내에서 읽기 일관성을 보장한다.
    const mockTx = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ email: 'tx@example.com' }),
      },
    } as unknown as PrismaTransaction;

    await findUserById('user-1', mockTx);

    expect(mockTx.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { email: true },
    });
  });
});
