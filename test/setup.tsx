// AuthProvider mocking하고, fetch를 가짜로 만들어서 error 로그 방지
// 실제로 유저 정보를 이용하여 테스트를 할때는 useSession mocking 필요
jest.mock('@/providers/auth-provider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  }),
) as jest.Mock;
