import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reprman.com'
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME_UTC
  const parsedBuildTime = buildTime ? new Date(buildTime) : null
  const lastModified =
    parsedBuildTime && !Number.isNaN(parsedBuildTime.valueOf())
      ? parsedBuildTime
      : new Date()

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
