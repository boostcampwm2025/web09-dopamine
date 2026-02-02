import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Modal from '@/components/modal/modal';
import Tooltip from '@/components/tooltip/tooltip';
import { AuthProvider } from '@/providers/auth-provider';
import { Providers } from '@/providers/query-provider';
import ThemeProvider from '@/providers/theme-provider';
import EmotionRegistry from '@/styles/EmotionRegistry';
import { pretendard } from '@/styles/fonts';
import GlobalStyle from '@/styles/globalStyles';

export const metadata: Metadata = {
  metadataBase: new URL('https://murphy.co.kr'),
  title: 'Murphy',
  description:
    '발산은 자유롭게, 수렴은 확실하게. 아이디어 브레인스토밍부터 의사결정까지 Murphy가 안내합니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${pretendard.variable} ${pretendard.className}`}>
        <EmotionRegistry>
          <AuthProvider>
            <Providers>
              <ThemeProvider>
                <GlobalStyle />
                <Tooltip />
                <Toaster />
                <Modal />
                {children}
              </ThemeProvider>
            </Providers>
          </AuthProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
