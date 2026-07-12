'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  Loader2,
  Sparkles,
} from 'lucide-react'

import { DocumentUploadLazy } from '@/components/document-upload-lazy'
import type { AnalysisResult, InferredContext } from '@/lib/types'
import { cn } from '@/lib/utils'

const SEVERITY_STYLES = {
  blocker: 'border-red-500/40 bg-red-500/10 text-red-200',
  major: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  minor: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
  high: 'border-red-500/40 bg-red-500/10 text-red-200',
}

export function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [pendingContext, setPendingContext] = useState<InferredContext | null>(
    null
  )
  const [contextConfirmed, setContextConfirmed] = useState(false)
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null)

  const runAnalysis = async (confirmedContext?: InferredContext) => {
    if (!resumeText.trim() || loading) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescription.trim() || undefined,
          confirmedContext,
        }),
      })

      const payload = (await response.json()) as AnalysisResult & {
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error ?? `Request failed (${response.status})`)
      }

      if (!confirmedContext && !contextConfirmed) {
        setPendingContext(payload.inferredContext)
        setResult(null)
        return
      }

      setResult(payload)
      setPendingContext(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  const confirmContext = () => {
    if (!pendingContext) {
      return
    }
    setContextConfirmed(true)
    void runAnalysis({ ...pendingContext, confirmedByUser: true })
  }

  const updatePendingContext = (
    field: 'targetIndustry' | 'targetSeniority',
    value: string
  ) => {
    if (!pendingContext) {
      return
    }
    setPendingContext({ ...pendingContext, [field]: value })
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-card-border)] bg-[var(--color-card)] px-4 py-1.5 text-sm text-[var(--color-muted)]">
          <Flame className="h-4 w-4 text-[var(--color-accent)]" />
          Honest resume feedback — not generic advice
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Roast my resume
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-[var(--color-muted)]">
          Paste your resume and an optional job description. Get ATS risk
          flags, seniority mismatch diagnosis, and concrete rewrites — anchored
          to your actual bullets.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5">
          <label className="mb-2 block text-sm font-medium" htmlFor="resume">
            Resume
          </label>
          <DocumentUploadLazy
            disabled={loading}
            onExtracted={({ text, filename }) => {
              setResumeText(text)
              setUploadedFilename(filename)
              setContextConfirmed(false)
              setPendingContext(null)
              setResult(null)
              setError(null)
            }}
          />
          {uploadedFilename && (
            <p className="mb-2 text-xs text-[var(--color-muted)]">
              Loaded from PDF: {uploadedFilename}
            </p>
          )}
          <textarea
            id="resume"
            value={resumeText}
            onChange={(event) => {
              setResumeText(event.target.value)
              setUploadedFilename(null)
              setContextConfirmed(false)
              setPendingContext(null)
              setResult(null)
            }}
            placeholder="Paste your resume text here, or upload a PDF above…"
            rows={14}
            className="w-full rounded-xl border border-[var(--color-card-border)] bg-[#0d1219] px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </section>

        <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5">
          <label className="mb-2 block text-sm font-medium" htmlFor="jd">
            Target job description (optional)
          </label>
          <textarea
            id="jd"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the job description you're applying to…"
            rows={16}
            className="w-full rounded-xl border border-[var(--color-card-border)] bg-[#0d1219] px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </section>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          disabled={loading || !resumeText.trim()}
          onClick={() => {
            setContextConfirmed(false)
            void runAnalysis()
          }}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-8 font-medium text-white transition hover:bg-orange-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze resume
            </>
          )}
        </button>
      </div>

      {pendingContext && !result && (
        <section className="mt-8 rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent-soft)] p-6">
          <h2 className="mb-2 text-lg font-medium">Confirm your target context</h2>
          <p className="mb-4 text-sm text-[var(--color-muted)]">
            We inferred your target industry and seniority. Correct anything
            wrong before we generate rewrites.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[var(--color-muted)]">
                Target industry
              </label>
              <input
                value={pendingContext.targetIndustry}
                onChange={(event) =>
                  updatePendingContext('targetIndustry', event.target.value)
                }
                className="h-10 w-full rounded-lg border border-[var(--color-card-border)] bg-[#0d1219] px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--color-muted)]">
                Target seniority
              </label>
              <input
                value={pendingContext.targetSeniority}
                onChange={(event) =>
                  updatePendingContext('targetSeniority', event.target.value)
                }
                className="h-10 w-full rounded-lg border border-[var(--color-card-border)] bg-[#0d1219] px-3 text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={confirmContext}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white"
          >
            <CheckCircle2 className="h-4 w-4" />
            Looks right — run full analysis
          </button>
        </section>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      {result && (
        <div className="mt-10 space-y-8">
          {result.structuralRisk.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-medium">ATS structural risks</h2>
              <ul className="space-y-3">
                {result.structuralRisk.map((risk) => (
                  <li
                    key={risk.issue}
                    className={cn(
                      'rounded-xl border px-4 py-3 text-sm',
                      SEVERITY_STYLES[risk.severity as keyof typeof SEVERITY_STYLES] ??
                        SEVERITY_STYLES.minor
                    )}
                  >
                    <p className="font-medium">{risk.issue}</p>
                    <p className="mt-1 opacity-90">{risk.explanation}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.findings.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-medium">Findings & rewrites</h2>
              <ul className="space-y-4">
                {result.findings.map((finding, index) => (
                  <li
                    key={`${finding.sourceText.slice(0, 24)}-${index}`}
                    className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5"
                  >
                    <div className="mb-3 flex flex-wrap gap-2 text-xs">
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 capitalize',
                          SEVERITY_STYLES[finding.severity]
                        )}
                      >
                        {finding.severity}
                      </span>
                      <span className="rounded-full border border-[var(--color-card-border)] px-2 py-0.5 capitalize text-[var(--color-muted)]">
                        {finding.category.replace('_', ' ')}
                      </span>
                      {finding.fabricationCheck === 'flagged_for_review' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-amber-200">
                          <AlertTriangle className="h-3 w-3" />
                          Verify rewrite
                        </span>
                      )}
                    </div>
                    <blockquote className="border-l-2 border-[var(--color-accent)] pl-3 text-sm text-[var(--color-muted)]">
                      {finding.sourceText}
                    </blockquote>
                    <p className="mt-3 text-sm">{finding.diagnosis}</p>
                    <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-200">
                        Suggested rewrite
                      </p>
                      <p className="text-sm leading-relaxed">{finding.rewrite}</p>
                    </div>
                    <p className="mt-3 text-xs text-[var(--color-muted)]">
                      {finding.whyItMatters}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.jdDelta.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-medium">Job description gaps</h2>
              <ul className="space-y-3">
                {result.jdDelta.map((delta) => (
                  <li
                    key={delta.jdRequirement}
                    className="rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4 text-sm"
                  >
                    <p className="font-medium">{delta.jdRequirement}</p>
                    <p className="mt-1 capitalize text-[var(--color-muted)]">
                      Coverage: {delta.resumeCoverage.replace('_', ' ')}
                    </p>
                    {delta.note && (
                      <p className="mt-2 text-[var(--color-muted)]">{delta.note}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
