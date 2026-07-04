import type { Metadata } from 'next'
import { getServerTranslation } from './getServerTranslation'

type CreatePageMetadataOptions = {
  titleKey: string
  descriptionKey?: string
  noindex?: boolean
}

export const createPageMetadata = async ({
  titleKey,
  descriptionKey = 'meta.description',
  noindex = false,
}: CreatePageMetadataOptions): Promise<Metadata> => {
  const { t } = await getServerTranslation()
  const title = `${t(titleKey)} - ${t('brand.reprMan')}`
  const description = t(descriptionKey)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    robots: noindex ? { index: false, follow: false } : undefined,
  }
}
