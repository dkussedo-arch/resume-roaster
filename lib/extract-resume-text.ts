'use client'

import { extractTextFromDocx } from '@/lib/extract-docx-text'
import { extractTextFromPdf } from '@/lib/extract-pdf-text'

export type ResumeFileKind = 'pdf' | 'docx'

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export function getResumeFileKind(file: File): ResumeFileKind | null {
  const name = file.name.toLowerCase()
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf'
  }
  if (file.type === DOCX_MIME || name.endsWith('.docx')) {
    return 'docx'
  }
  return null
}

export function contentTypeForKind(kind: ResumeFileKind): string {
  return kind === 'pdf' ? 'application/pdf' : DOCX_MIME
}

export async function extractResumeText(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ text: string; kind: ResumeFileKind }> {
  const kind = getResumeFileKind(file)
  if (!kind) {
    throw new Error('Only PDF and DOCX files are supported.')
  }

  if (kind === 'pdf') {
    const text = await extractTextFromPdf(file, onProgress)
    return { text, kind }
  }

  onProgress?.(20)
  const text = await extractTextFromDocx(file)
  onProgress?.(100)
  return { text, kind }
}
