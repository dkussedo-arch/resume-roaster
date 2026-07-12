'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

export const FileUploadLazy = dynamic(
  () => import('@/components/FileUpload').then((mod) => mod.FileUpload),
  {
    ssr: false,
    loading: () => (
      <section className="mx-auto w-full max-w-5xl px-4 pt-10">
        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-[var(--color-card-border)] px-6 py-10 text-sm text-[var(--color-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading file upload…
        </div>
      </section>
    ),
  }
)
