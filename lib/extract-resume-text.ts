'use client'

import { extractTextFromDocx } from '@/lib/extract-docx-text'
import { extractTextFromPdf } from '@/lib/extract-pdf-text'

export type ResumeFileKind = 'pdf' | 'docx' | 'txt'

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
  if (file.type === 'text/plain' || name.endsWith('.txt')) {
    return 'txt'
  }
  return null
}

export function contentTypeForKind(kind: ResumeFileKind): string {
  if (kind === 'pdf') {
    return 'application/pdf'
  }
  if (kind === 'docx') {
    return DOCX_MIME
  }
  return 'text/plain'
}

async function extractTextFromTxt(file: File): Promise<string> {
  const text = (await file.text()).trim()
  if (!text) {
    throw new Error('This TXT file is empty.')
  }
  return text
}

export async function extractResumeText(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ text: string; kind: ResumeFileKind }> {
  const kind = getResumeFileKind(file)
  if (!kind) {
    throw new Error('Only PDF, DOCX, and TXT files are supported.')
  }

  if (kind === 'pdf') {
    const text = await extractTextFromPdf(file, onProgress)
    return { text, kind }
  }

  if (kind === 'docx') {
    onProgress?.(20)
    const text = await extractTextFromDocx(file)
    onProgress?.(100)
    return { text, kind }
  }

  onProgress?.(40)
  const text = await extractTextFromTxt(file)
  onProgress?.(100)
  return { text, kind }
}
