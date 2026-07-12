'use client'

import mammoth from 'mammoth'

/**
 * Extract plain text from a DOCX file in the browser.
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  const text = result.value.replace(/\n{3,}/g, '\n\n').trim()

  if (!text) {
    throw new Error(
      'Could not extract text from this DOCX. Try pasting the resume text instead.'
    )
  }

  return text
}
