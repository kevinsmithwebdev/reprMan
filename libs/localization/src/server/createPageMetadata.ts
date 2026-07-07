import type { Metadata } from 'next'
import { getServerTranslation } from './getServerTranslation'

type CreatePageMetadataOptions = {
  titleKey: string
  descriptionKey?: string
  noindex?: boolean
  canonicalPath?: string
}

export const createPageMetadata = async ({
  titleKey,
  descriptionKey = 'meta.description',
  noindex = false,
  canonicalPath = '/',
}: CreatePageMetadataOptions): Promise<Metadata> => {
  const { t } = await getServerTranslation()
  const title = `${t(titleKey)} - ${t('brand.reprMan')}`
  const description = t(descriptionKey)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reprman.com'
  const canonical =
    canonicalPath === '/' ? siteUrl : `${siteUrl}${canonicalPath}`
  const socialImage = `${siteUrl}/static/repr.jpg`

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      siteName: 'ReprMan',
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: 'ReprMan app preview',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
    },
    robots: noindex ? { index: false, follow: false } : undefined,
  }
}
