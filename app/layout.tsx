import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'

import { PostHogPageView } from '@/components/posthog-page-view'
import { PostHogProvider } from '@/components/posthog-provider'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Resume Roaster',
  description:
    'AI-powered resume feedback — ATS risk detection, seniority mismatch diagnosis, and concrete rewrites.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
