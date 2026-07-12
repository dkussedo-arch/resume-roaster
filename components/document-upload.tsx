'use client'

import { useRef, useState } from 'react'
import { CheckCircle2, FileUp, Loader2, Upload, XCircle } from 'lucide-react'

import { extractTextFromPdf } from '@/lib/extract-pdf-text'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

interface DocumentUploadProps {
  disabled?: boolean
  onExtracted: (payload: {
    text: string
    filename: string
    storagePath: string | null
  }) => void
}

export function DocumentUpload({ disabled, onExtracted }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'extracting' | 'uploading'>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const busy = phase !== 'idle' || Boolean(disabled)

  const processFile = async (file: File) => {
    if (busy) {
      return
    }

    setError(null)
    setStatus(null)

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.')
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('File is too large. Maximum size is 10 MB.')
      return
    }

    try {
      setPhase('extracting')
      setProgress(5)
      const text = await extractTextFromPdf(file, setProgress)

      setPhase('uploading')
      setProgress(90)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const payload = (await response.json()) as {
        error?: string
        storagePath?: string | null
        storageUploaded?: boolean
        storageSkipped?: boolean
        message?: string
      }

      if (!response.ok) {
        // Extraction succeeded — still hand text to the analyzer.
        onExtracted({ text, filename: file.name, storagePath: null })
        throw new Error(
          payload.error ??
            'Storage upload failed. Resume text was still extracted for analysis.'
        )
      }

      onExtracted({
        text,
        filename: file.name,
        storagePath: payload.storagePath ?? null,
      })

      setProgress(100)
      if (payload.storageUploaded) {
        setStatus(`Uploaded ${file.name} to Supabase Storage and extracted text.`)
      } else if (payload.storageSkipped) {
        setStatus(
          `Extracted text from ${file.name}. Configure Supabase to enable Storage uploads.`
        )
      } else {
        setStatus(`Extracted text from ${file.name}.`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process PDF.')
    } finally {
      setPhase('idle')
      setProgress(0)
    }
  }

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) {
      return
    }
    void processFile(file)
  }

  return (
    <div className="mb-4 space-y-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !busy) {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!busy) {
            setIsDragging(true)
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setIsDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          if (!busy) {
            handleFiles(event.dataTransfer.files)
          }
        }}
        onClick={() => {
          if (!busy) {
            inputRef.current?.click()
          }
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition',
          isDragging
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
            : 'border-[var(--color-card-border)] bg-[#0d1219] hover:border-[var(--color-accent)]/60',
          busy && 'pointer-events-none opacity-60'
        )}
      >
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
          {phase === 'idle' ? (
            <Upload className="h-5 w-5 text-[var(--color-accent)]" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent)]" />
          )}
        </div>
        <p className="text-sm font-medium">
          {phase === 'extracting'
            ? `Extracting text… ${progress}%`
            : phase === 'uploading'
              ? 'Uploading to Supabase Storage…'
              : 'Drop a PDF resume, or click to browse'}
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">PDF · up to 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          disabled={busy}
          onChange={(event) => {
            handleFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--color-card-border)] px-3 text-xs font-medium text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)] disabled:opacity-50"
      >
        <FileUp className="h-3.5 w-3.5" />
        Choose PDF
      </button>

      {status && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{status}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200"
        >
          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
