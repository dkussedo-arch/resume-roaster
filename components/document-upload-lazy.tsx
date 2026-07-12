'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

export const DocumentUploadLazy = dynamic(
  () =>
    import('@/components/document-upload').then((mod) => mod.DocumentUpload),
  {
    ssr: false,
    loading: () => (
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-dashed border-[var(--color-card-border)] px-4 py-6 text-xs text-[var(--color-muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading upload…
      </div>
    ),
  }
)
