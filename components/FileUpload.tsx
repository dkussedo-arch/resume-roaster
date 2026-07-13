'use client'

import { useRef, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { OutputRatingButtons } from '@/components/output-rating-buttons'
import {
  trackAiGenerationCompleted,
  trackAiGenerationStarted,
  trackFileUploaded,
} from '@/lib/analytics'
import {
  contentTypeForKind,
  extractResumeText,
  getResumeFileKind,
} from '@/lib/extract-resume-text'
import { createClient } from '@/lib/supabase'
import type { AnalysisResult } from '@/lib/types'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ACCEPTED =
  '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'

type Phase =
  | 'idle'
  | 'extracting'
  | 'uploading'
  | 'analyzing'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isSupabaseBrowserConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

async function uploadToSupabase(file: File, kind: 'pdf' | 'docx' | 'txt') {
  const supabase = createClient()
  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'resumes'
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: contentTypeForKind(kind),
    upsert: false,
  })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  return path
}

export function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)
  const [storagePath, setStoragePath] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const processing = phase !== 'idle'

  const processFile = async (file: File) => {
    if (processing) {
      return
    }

    setError(null)
    setResult(null)
    setFilename(null)
    setStoragePath(null)

    const kind = getResumeFileKind(file)
    if (!kind) {
      setError('Invalid file type. Please upload a PDF, DOCX, or TXT file.')
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(
        `File is too large (${formatFileSize(file.size)}). Maximum size is 10 MB.`
      )
      return
    }

    try {
      setPhase('extracting')
      setProgress(5)
      const { text } = await extractResumeText(file, (pct) => {
        setProgress(Math.min(40, Math.round(pct * 0.4)))
      })
      trackFileUploaded(file.size / 1024, kind)

      setFilename(file.name)
      setProgress(45)

      if (isSupabaseBrowserConfigured()) {
        setPhase('uploading')
        try {
          const path = await uploadToSupabase(file, kind)
          setStoragePath(path)
        } catch (uploadError) {
          // Extraction succeeded — continue analysis even if storage fails.
          console.error(uploadError)
        }
      }

      setPhase('analyzing')
      setProgress(70)

      const startedAt = performance.now()
      trackAiGenerationStarted('resume_analysis')

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText: text,
            confirmedContext: {
              targetIndustry: 'Unknown',
              targetSeniority: 'Unknown',
              confirmedByUser: true,
            },
          }),
        })

        const payload = (await response.json()) as AnalysisResult & {
          error?: string
        }

        if (!response.ok) {
          throw new Error(payload.error ?? `Analysis failed (${response.status})`)
        }

        trackAiGenerationCompleted(
          'resume_analysis',
          performance.now() - startedAt,
          true
        )
        setResult(payload)
        setProgress(100)
      } catch (analysisError) {
        trackAiGenerationCompleted(
          'resume_analysis',
          performance.now() - startedAt,
          false
        )
        throw analysisError
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file.')
      setFilename(null)
    } finally {
      setPhase('idle')
      setProgress(0)
    }
  }

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0]
    if (!file || processing) {
      return
    }
    void processFile(file)
  }

  const phaseLabel: Record<Phase, string> = {
    idle: '',
    extracting: 'Extracting text…',
    uploading: 'Uploading to Supabase…',
    analyzing: 'Analyzing with AI…',
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pt-10">
      <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-xl shadow-black/20">
        <div className="mb-5">
          <h2 className="text-lg font-medium">Upload a resume</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Drop a PDF, DOCX, or TXT file (max 10 MB). We extract the text, then
            send it to Claude for analysis.
          </p>
        </div>

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ' ') && !processing) {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragOver={(event) => {
            event.preventDefault()
            if (!processing) {
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
            if (!processing) {
              handleFiles(event.dataTransfer.files)
            }
          }}
          onClick={() => {
            if (!processing) {
              inputRef.current?.click()
            }
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition',
            isDragging
              ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
              : 'border-[var(--color-card-border)] bg-[#0d1219] hover:border-[var(--color-accent)]/60',
            processing && 'pointer-events-none opacity-60'
          )}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
            {processing ? (
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
            ) : (
              <Upload className="h-6 w-6 text-[var(--color-accent)]" />
            )}
          </div>
          <p className="font-medium">
            Drag and drop your resume here, or click to browse
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            PDF, DOCX, or TXT · up to 10 MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            disabled={processing}
            onChange={(event) => {
              handleFiles(event.target.files)
              event.target.value = ''
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            disabled={processing}
            onClick={() => inputRef.current?.click()}
            className="bg-[var(--color-accent)] text-white hover:bg-orange-500"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Choose file & analyze
              </>
            )}
          </Button>

          {filename && !error && (
            <span className="text-sm text-[var(--color-muted)]">
              Selected: <span className="font-medium text-[var(--color-foreground)]">{filename}</span>
            </span>
          )}
        </div>

        {filename && !error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              Uploaded <span className="font-medium">{filename}</span>
              {storagePath ? ' · saved to Supabase Storage' : ''}
            </span>
          </div>
        )}

        {processing && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-[var(--color-muted)]">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--color-accent)]" />
                {phaseLabel[phase]}
              </span>
              <span className="text-[var(--color-muted)]">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#0d1219]">
              <div
                className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4 rounded-xl border border-[var(--color-card-border)] bg-[#0d1219] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-accent)]">
                <CheckCircle2 className="h-4 w-4" />
                Analysis complete
              </div>
              <OutputRatingButtons />
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              Inferred target:{' '}
              <span className="text-[var(--color-foreground)]">
                {result.inferredContext.targetSeniority} ·{' '}
                {result.inferredContext.targetIndustry}
              </span>
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              {result.findings.length} finding
              {result.findings.length === 1 ? '' : 's'}
              {result.structuralRisk.length > 0
                ? ` · ${result.structuralRisk.length} ATS risk flag${result.structuralRisk.length === 1 ? '' : 's'}`
                : ''}
            </p>
            {result.findings.slice(0, 3).map((finding, index) => (
              <div
                key={`${finding.sourceText.slice(0, 20)}-${index}`}
                className="rounded-lg border border-[var(--color-card-border)] px-3 py-3 text-sm"
              >
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  {finding.severity} · {finding.category.replace('_', ' ')}
                </p>
                <p className="mt-1">{finding.diagnosis}</p>
                {finding.fabricationCheck === 'flagged_for_review' && (
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-amber-200">
                    <AlertTriangle className="h-3 w-3" />
                    Verify rewrite before using
                  </p>
                )}
              </div>
            ))}
            {result.findings.length > 3 && (
              <p className="text-xs text-[var(--color-muted)]">
                +{result.findings.length - 3} more findings — use the full
                analyzer below for details and rewrites.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
