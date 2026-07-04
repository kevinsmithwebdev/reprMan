'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const useReplaceWhen = (when: boolean, href: string) => {
  const router = useRouter()

  useEffect(() => {
    if (when) {
      router.replace(href)
    }
  }, [when, href, router])
}
