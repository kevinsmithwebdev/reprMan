import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reprman.com'
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/about', '/terms'],
      disallow: [
        '/settings',
        '/reports',
        '/subscribe',
        '/view/',
        '/signin',
        '/signup',
        '/forgot-password',
        '/change-password',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
