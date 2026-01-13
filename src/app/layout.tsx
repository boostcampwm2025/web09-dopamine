import { QueryClient } from '@tanstack/react-query';
import 'pretendard/dist/web/static/pretendard.css';
import { Toaster } from 'react-hot-toast';
import Modal from '@/components/modal/modal';
import Tooltip from '@/components/tooltip/tooltip';
import ThemeProvider from '@/providers/ThemeProvider';
import { Providers } from '@/providers/query-provider';
import EmotionRegistry from '@/styles/EmotionRegistry';
import GlobalStyle from '@/styles/globalStyles';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <EmotionRegistry>
          <Providers>
            <ThemeProvider>
              <GlobalStyle />
              <Tooltip />
              <Toaster />
              <Modal />
              {children}
            </ThemeProvider>
          </Providers>
        </EmotionRegistry>
      </body>
    </html>
  );
}
