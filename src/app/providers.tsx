'use client';

import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import EmotionRegistry from './emotion-registry';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </EmotionRegistry>
  );
}
