'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { pathnameToPageName, trackPageViewed } from '@/lib/analytics'

export function PostHogPageView() {
  const pathname = usePathname()

  useEffect(() => {
    trackPageViewed(pathnameToPageName(pathname))
  }, [pathname])

  return null
}
