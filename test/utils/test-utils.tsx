import React, { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderHookOptions, RenderOptions, render, renderHook } from '@testing-library/react';
import { AuthProvider } from '@/providers/auth-provider';
import ThemeProvider from '@/providers/theme-provider';

// 1. 전역 래퍼 (RootLayout 구조 반영)
const createWrapper = () => {
  // 테스트용 쿼리 클라이언트
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

// 2. 커스텀 render 함수 (컴포넌트용)
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: createWrapper(), ...options });

// 3. 커스텀 renderHook 함수 (훅용)
const customRenderHook = <Result, Props>(
  render: (initialProps: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'>,
) => renderHook(render, { wrapper: createWrapper(), ...options });

// 4. RTL의 모든 기능을 그대로 내보내되, 커스텀 함수로 덮어씌움
export * from '@testing-library/react';
export { customRender as render };
export { customRenderHook as renderHook };
