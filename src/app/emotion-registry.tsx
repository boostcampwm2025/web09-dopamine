'use client';

import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() =>
    createCache({
      key: 'css',
      prepend: true,
    }),
  );

  useServerInsertedHTML(() => (
    <style
      data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
      dangerouslySetInnerHTML={{
        __html: Object.values(cache.inserted).join(''),
      }}
    />
  ));

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
