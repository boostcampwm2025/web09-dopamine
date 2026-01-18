'use client';

import { ReactNode } from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>;
}
