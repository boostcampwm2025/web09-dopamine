# API 테스트 헬퍼 사용 가이드

## 개요

`test/utils/api-test-helpers.ts`는 API route 테스트를 위한 공통 헬퍼 함수들을 제공합니다.

## 주요 헬퍼 함수

### 1. Request 생성

#### `createMockRequest(body?, options?)`
POST/PATCH/PUT 요청용 Mock Request 생성

```typescript
const req = createMockRequest({ status: 'CLOSE' });
const req = createMockRequest({ name: 'Test' }, { method: 'PATCH' });
```

#### `createMockGetRequest(options?)`
GET 요청용 Mock Request 생성 (body 없음)

```typescript
const req = createMockGetRequest();
```

### 2. Params 생성

#### `createMockParams(params)`
Next.js 동적 라우트 파라미터 생성

```typescript
// 단일 파라미터
const params = createMockParams({ issueId: 'issue-1' });

// 여러 파라미터
const params = createMockParams({ 
  issueId: 'issue-1', 
  ideaId: 'idea-1' 
});
```

### 3. Session 생성

#### `createMockSession(userId, additionalData?)`
인증된 사용자 세션 생성

```typescript
const session = createMockSession('user-1');
const session = createMockSession('user-1', { 
  user: { name: 'John Doe' } 
});
```

#### `createUnauthenticatedSession()`
인증되지 않은 사용자 (null 반환)

```typescript
const session = createUnauthenticatedSession(); // null
```

### 4. 인증 모킹

#### `setupAuthMock(getServerSessionMock, session)`
getServerSession 모킹 설정

```typescript
import { getServerSession } from 'next-auth';

jest.mock('next-auth');
const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// 인증된 사용자
setupAuthMock(mockedGetServerSession, createMockSession('user-1'));

// 인증되지 않은 사용자
setupAuthMock(mockedGetServerSession, null);
```

### 5. Response 검증

#### `expectErrorResponse(response, status, errorCode?)`
에러 응답 검증

```typescript
const response = await PATCH(req, params);
await expectErrorResponse(response, 401, 'UNAUTHORIZED');
await expectErrorResponse(response, 404); // errorCode 생략 가능
```

#### `expectSuccessResponse(response, status?, validator?)`
성공 응답 검증

```typescript
const response = await GET(req, params);
const data = await expectSuccessResponse(response, 200);

// 커스텀 검증
const data = await expectSuccessResponse(response, 200, (data) => {
  expect(data.id).toBe('issue-1');
  expect(data.status).toBe('CLOSE');
});
```

### 6. 인증 테스트 헬퍼

#### `testUnauthenticatedAccess(handler, getServerSessionMock, params, request?)`
인증되지 않은 사용자 접근 테스트

```typescript
await testUnauthenticatedAccess(
  PATCH,
  mockedGetServerSession,
  createMockParams({ issueId: 'issue-1' })
);
```

### 7. Prisma Transaction 모킹

#### `setupPrismaTransactionMock(mockTransaction, callback?)`
Prisma 트랜잭션 모킹 설정

```typescript
setupPrismaTransactionMock(mockedPrismaTransaction, (mockTx) => {
  // mockTx를 사용한 추가 설정
  return mockTx;
});
```

## 사용 예시

### 기본 예시

```typescript
import { PATCH } from '@/app/api/issues/[issueId]/status/route';
import { getServerSession } from 'next-auth';
import {
  createMockRequest,
  createMockParams,
  createMockSession,
  setupAuthMock,
  expectErrorResponse,
  expectSuccessResponse,
} from '@/test/utils/api-test-helpers';

jest.mock('next-auth');
const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('PATCH /api/issues/[issueId]/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인증되지 않은 사용자는 401을 받는다', async () => {
    setupAuthMock(mockedGetServerSession, null);
    
    const req = createMockRequest({ status: 'CLOSE' });
    const params = createMockParams({ issueId: 'issue-1' });
    
    const response = await PATCH(req, params);
    await expectErrorResponse(response, 401, 'UNAUTHORIZED');
  });

  it('상태를 성공적으로 변경한다', async () => {
    setupAuthMock(mockedGetServerSession, createMockSession('user-1'));
    
    // ... repository 모킹 ...
    
    const req = createMockRequest({ status: 'CLOSE' });
    const params = createMockParams({ issueId: 'issue-1' });
    
    const response = await PATCH(req, params);
    const data = await expectSuccessResponse(response, 200);
    
    expect(data.status).toBe('CLOSE');
  });
});
```

### 인증 테스트 간소화

```typescript
import { testUnauthenticatedAccess } from '@/test/utils/api-test-helpers';

it('인증되지 않은 사용자는 접근할 수 없다', async () => {
  await testUnauthenticatedAccess(
    PATCH,
    mockedGetServerSession,
    createMockParams({ issueId: 'issue-1' }),
    createMockRequest({ status: 'CLOSE' })
  );
});
```

## 주의사항

1. **params 타입**: Next.js 15+ 에서는 `params`가 `Promise`로 래핑되어야 합니다. `createMockParams`가 이를 자동 처리합니다.

2. **issueId vs id**: 최근 리팩토링으로 `[issueId]`를 사용하므로 `createMockParams({ issueId: '...' })`를 사용해야 합니다.

3. **기존 테스트 업데이트**: 기존 테스트의 `createMockParams({ id: '...' })`를 `createMockParams({ issueId: '...' })`로 변경해야 합니다.
