import localFont from 'next/font/local';

export const pretendard = localFont({
  src: [
    {
      path: '../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../node_modules/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-pretendard',
  display: 'swap',
});
