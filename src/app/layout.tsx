import 'pretendard/dist/web/static/pretendard.css';
import Tooltip from '@/components/tooltip/tooltip';
import ThemeProvider from '@/providers/ThemeProvider';
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
          <ThemeProvider>
            <GlobalStyle />
            <Tooltip />
            {children}
          </ThemeProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
