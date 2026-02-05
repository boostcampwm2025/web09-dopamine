import type { MetadataRoute } from 'next';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/project',
          '/project/',
          '/issue',
          '/issue/',
          '/topic',
          '/topic/',
          '/mypage',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
