'use client'

/**
 * Extract text from a PDF in the browser via pdfjs-dist (dynamic import).
 * Keeps PDF.js off the SSR path.
 */
export async function extractTextFromPdf(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const pdfjs = await import('pdfjs-dist')

  // CDN worker avoids bundling the worker into the Next.js SSR graph.
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

  const data = new Uint8Array(await file.arrayBuffer())
  const doc = await pdfjs.getDocument({ data }).promise
  const pages: string[] = []

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
    const page = await doc.getPage(pageNum)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    pages.push(text)
    onProgress?.(Math.round((pageNum / doc.numPages) * 100))
  }

  const combined = pages.join('\n\n').replace(/[ \t]+\n/g, '\n').trim()
  if (!combined) {
    throw new Error(
      'Could not extract text from this PDF. It may be image-only — try pasting text instead.'
    )
  }

  return combined
}
