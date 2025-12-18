import 'pretendard/dist/web/static/pretendard.css';
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
          <GlobalStyle />
          {children}
        </EmotionRegistry>
      </body>
    </html>
  );
}
