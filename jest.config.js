/** @type {import('jest').Config} */
const config = {
  // ts-jest로 TS 테스트 파일을 즉시 변환합니다.
  preset: 'ts-jest',
  // 기본 테스트 환경(Node.js API, DOM 아님)
  testEnvironment: 'node',
  // Jest가 탐색할 폴더 범위를 제한합니다.
  roots: ['<rootDir>/test'],
  // 테스트 파일로 인식할 패턴입니다.
  testMatch: ['<rootDir>/test/**/*.test.ts', '<rootDir>/test/**/*.spec.ts'],
  moduleNameMapper: {
    // 테스트에서 tsconfig의 경로 별칭을 사용합니다.
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  transformIgnorePatterns: [
    // node_modules는 기본적으로 변환하지 않고, 아래 패키지만 예외로 처리합니다(prisma-adapger, next-auth).
    'node_modules/(?!(@auth/prisma-adapter|next-auth)/)',
  ],
  // 커버리지 대상 파일(타입 정의, 스토리북 제외)
  // collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],

  // 테스트 파일 실행 전에 먼저 실행
  setupFilesAfterEnv: ['<rootDir>/test/setup.tsx'],

  // 일단 tsx는 제외
  collectCoverageFrom: ['src/**/*.{ts}', '!src/**/*.d.ts'],

  // 커버리지 리포트 출력 폴더
  coverageDirectory: 'coverage',
  // 테스트 간 목을 자동 초기화합니다.
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

module.exports = config;
