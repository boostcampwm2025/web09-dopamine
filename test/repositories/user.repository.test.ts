import { prisma } from '@/lib/prisma';
import {
  createAnonymousUser,
  deleteUser,
  findUserById,
  updateUser,
} from '@/lib/repositories/user.repository';
import { PrismaTransaction } from '@/types/prisma';

// 1. Prisma의 모든 모델과 $transaction을 모킹합니다.
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    session: { deleteMany: jest.fn() },
    account: { deleteMany: jest.fn() },
    projectMember: { deleteMany: jest.fn() },
    issueMember: { deleteMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const mockedUser = prisma.user as jest.Mocked<typeof prisma.user>;
const mockedTransaction = prisma.$transaction as jest.Mock;

describe('User Repository 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAnonymousUser', () => {
    it('익명 유저를 트랜잭션으로 생성한다', async () => {
      // 역할: 익명 사용자 생성이 트랜잭션 내에서 안전하게 처리되는지 확인한다.
      const mockTx = {
        user: {
          create: jest.fn().mockResolvedValue({ id: 'user-1' }),
        },
      } as unknown as PrismaTransaction;

      await createAnonymousUser(mockTx, '익명');

      expect(mockTx.user.create).toHaveBeenCalledWith({
        data: { displayName: null, provider: null },
      });
    });
  });

  describe('findUserById', () => {
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

  describe('deleteUser', () => {
    it('유저와 연관된 모든 데이터(세션, 계정, 멤버)를 트랜잭션으로 삭제한다', async () => {
      // 역할: 참조 무결성을 위해 연관 데이터를 먼저 지우고 유저를 삭제하는지 검증한다.
      const userId = 'user-delete-1';

      // 트랜잭션 내부에서 사용할 Mock 클라이언트
      const mockTx = {
        session: { deleteMany: jest.fn() },
        account: { deleteMany: jest.fn() },
        projectMember: { deleteMany: jest.fn() },
        issueMember: { deleteMany: jest.fn() },
        user: { delete: jest.fn().mockResolvedValue({ id: userId }) },
      };

      // $transaction이 호출되면 내부 콜백을 실행하도록 설정
      mockedTransaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      await deleteUser(userId);

      // 1. 트랜잭션 시작 확인
      expect(mockedTransaction).toHaveBeenCalled();

      // 2. 연관 데이터 삭제 호출 확인 (순서 중요 로직 있다면 순서도 확인 가능)
      expect(mockTx.session.deleteMany).toHaveBeenCalledWith({ where: { userId } });
      expect(mockTx.account.deleteMany).toHaveBeenCalledWith({ where: { userId } });
      expect(mockTx.projectMember.deleteMany).toHaveBeenCalledWith({ where: { userId } });
      expect(mockTx.issueMember.deleteMany).toHaveBeenCalledWith({ where: { userId } });

      // 3. 최종 유저 삭제 확인
      expect(mockTx.user.delete).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });

  describe('updateUser', () => {
    it('유저 정보를 업데이트하고 변경된 displayName을 반환한다', async () => {
      // 역할: 업데이트 로직이 올바른 필드를 수정하고 결과를 반환하는지 확인한다.
      const userId = 'user-update-1';
      const updateData = { displayName: 'New Name' };
      const mockResult = { id: userId, displayName: 'New Name' };

      mockedUser.update.mockResolvedValue(mockResult as any);

      const result = await updateUser(userId, updateData);

      expect(mockedUser.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
        select: { displayName: true },
      });
      expect(result).toEqual(mockResult);
    });
  });
});
