/// <reference path="../../src/types/next-auth.d.ts" />
// authOptions 설정(어댑터/콜백) 단위 테스트
// NextAuth 어댑터 타입
import type { Adapter, AdapterUser } from 'next-auth/adapters';
// prisma 모킹 대상
import { prisma } from '@/lib/prisma';

// prisma.user.create를 모킹
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

// PrismaAdapter 자체를 단순 객체로 모킹
jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: () => ({}),
}));

describe('authOptions', () => {
  // prisma 모킹 인스턴스 캐스팅
  const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    // 테스트 간 모킹 상태 초기화
    jest.clearAllMocks();
  });

  it('createUser는 displayName을 name으로 저장한다', async () => {
    // authOptions 로드
    const { authOptions } = await import('@/lib/auth');
    // 어댑터에서 createUser 추출
    const adapter = authOptions.adapter as Adapter;

    // createUser에 전달될 입력 데이터
    const data: Omit<AdapterUser, 'id'> = {
      name: '홍길동',
      email: 'hong@example.com',
      image: 'https://example.com/img.png',
      emailVerified: null,
    };

    // prisma.user.create의 반환값 설정
    const mockedCreate = prisma.user.create as jest.MockedFunction<typeof prisma.user.create>;
    mockedCreate.mockResolvedValue({ id: 'user-1' } as any);

    const createUser = (
      authOptions.adapter as {
        createUser: (user: Omit<AdapterUser, 'id'>) => Promise<any>;
      }
    ).createUser!;

    // createUser 실행
    await createUser(data);

    // displayName이 name과 동일하게 저장되는지 검증
    expect(mockedPrisma.user.create).toHaveBeenCalledWith({
      data: {
        ...data,
        displayName: '홍길동',
      },
    });
  });

  it('session 콜백은 token.sub를 session.user.id로 주입한다', async () => {
    // authOptions 로드
    const { authOptions } = await import('@/lib/auth');

    // 기존 세션/토큰 준비
    const session = { user: { id: 'old-id', name: 'User' } } as any;
    const token = { sub: 'new-id' } as any;

    // session 콜백 실행
    const result = await authOptions.callbacks!.session!({ session, token } as any);

    // user.id가 token.sub로 변경되었는지 확인
    expect((result as any).user.id).toBe('new-id');
  });

  it('jwt 콜백은 update 트리거에서 name을 갱신한다', async () => {
    // authOptions 로드
    const { authOptions } = await import('@/lib/auth');

    // 토큰/세션 준비
    const token = { name: 'old' } as any;
    const session = { name: 'new' } as any;

    // jwt 콜백 실행 (trigger=update)
    const result = await authOptions.callbacks!.jwt!({
      token,
      trigger: 'update',
      session,
    } as any);

    // token.name이 갱신되었는지 확인
    expect(result.name).toBe('new');
  });

  it('jwt 콜백은 user가 있으면 token.id를 설정한다', async () => {
    // authOptions 로드
    const { authOptions } = await import('@/lib/auth');

    // 토큰/유저 준비
    const token = {} as any;
    const user = { id: 'user-1' } as any;

    // jwt 콜백 실행
    const result = await authOptions.callbacks!.jwt!({ token, user } as any);

    // token.id가 설정되었는지 확인
    expect(result.id).toBe('user-1');
  });
});
