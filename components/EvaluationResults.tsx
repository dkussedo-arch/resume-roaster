'use client'

import { useState } from 'react'
import {
  ChevronDown,
  Download,
  Filter,
  Flag,
  ShieldCheck,
} from 'lucide-react'

import type {
  EvaluatedClaim,
  EvaluationResult,
  EvaluationStatus,
} from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUS_ORDER: EvaluationStatus[] = [
  'SUPPORTED',
  'IMPLIED',
  'NOT_FOUND',
  'CONTRADICTED',
]

const STATUS_CONFIG: Record<
  EvaluationStatus,
  { label: string; badge: string; dot: string }
> = {
  SUPPORTED: {
    label: 'Supported',
    badge: 'border-emerald-500/50 bg-emerald-500/20 text-emerald-100',
    dot: 'bg-emerald-400',
  },
  IMPLIED: {
    label: 'Implied',
    badge: 'border-yellow-500/50 bg-yellow-500/20 text-yellow-100',
    dot: 'bg-yellow-400',
  },
  NOT_FOUND: {
    label: 'Not found',
    badge: 'border-orange-500/50 bg-orange-500/20 text-orange-100',
    dot: 'bg-orange-400',
  },
  CONTRADICTED: {
    label: 'Contradicted',
    badge: 'border-red-500/50 bg-red-500/20 text-red-100',
    dot: 'bg-red-400',
  },
}

const FLAGGED_STATUSES: EvaluationStatus[] = ['NOT_FOUND', 'CONTRADICTED']

type StatusFilter = EvaluationStatus | 'ALL'

interface EvaluationResultsProps {
  results: EvaluationResult
}

function computeMetrics(claims: EvaluatedClaim[]) {
  const total = claims.length
  const supported = claims.filter((c) => c.status === 'SUPPORTED').length
  const flagged = claims.filter((c) => FLAGGED_STATUSES.includes(c.status)).length

  return {
    total,
    supportedPct: total > 0 ? Math.round((supported / total) * 100) : 0,
    flaggedPct: total > 0 ? Math.round((flagged / total) * 100) : 0,
    supported,
    flagged,
  }
}

function buildExportReport(
  results: EvaluationResult,
  metrics: ReturnType<typeof computeMetrics>
): string {
  const lines = [
    '# Claim Evaluation Report',
    '',
    results.title ? `**Subject:** ${results.title}` : null,
    results.evaluatedAt ? `**Evaluated:** ${results.evaluatedAt}` : null,
    '',
    '## Overall',
    `- Total claims: ${metrics.total}`,
    `- Supported: ${metrics.supportedPct}%`,
    `- Flagged: ${metrics.flaggedPct}%`,
    '',
    '## Claims',
    '',
  ].filter((line): line is string => line !== null)

  for (const claim of results.claims) {
    lines.push(`### [${claim.status}] ${claim.claim}`)
    if (claim.rationale) {
      lines.push(`*Rationale:* ${claim.rationale}`)
    }
    if (claim.evidence) {
      lines.push(`*Evidence:* ${claim.evidence}`)
    }
    if (claim.sources?.length) {
      lines.push(`*Sources:* ${claim.sources.join('; ')}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function downloadReport(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function StatusBadge({ status }: { status: EvaluationStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-sm font-bold uppercase tracking-wide',
        config.badge
      )}
    >
      <span className={cn('h-2.5 w-2.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

function ClaimRow({ claim }: { claim: EvaluatedClaim }) {
  const [expanded, setExpanded] = useState(false)
  const hasDetail = Boolean(
    claim.evidence || claim.rationale || claim.sources?.length
  )

  return (
    <div className="rounded-xl border border-[var(--color-card-border)] bg-[#0d1219]">
      <button
        type="button"
        onClick={() => hasDetail && setExpanded((open) => !open)}
        disabled={!hasDetail}
        aria-expanded={hasDetail ? expanded : undefined}
        className={cn(
          'flex w-full items-start gap-4 px-4 py-4 text-left',
          hasDetail && 'cursor-pointer hover:bg-white/[0.02]'
        )}
      >
        <div className="shrink-0 pt-0.5">
          <StatusBadge status={claim.status} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-relaxed text-[var(--color-foreground)]">
            {claim.claim}
          </p>
          {!expanded && claim.rationale && (
            <p className="mt-1 line-clamp-1 text-xs text-[var(--color-muted)]">
              {claim.rationale}
            </p>
          )}
        </div>
        {hasDetail && (
          <ChevronDown
            className={cn(
              'mt-1 h-4 w-4 shrink-0 text-[var(--color-muted)] transition',
              expanded && 'rotate-180'
            )}
          />
        )}
      </button>

      {expanded && hasDetail && (
        <div className="space-y-3 border-t border-[var(--color-card-border)] px-4 py-4 text-xs text-[var(--color-muted)]">
          {claim.rationale && (
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-foreground)]">
                Rationale
              </p>
              <p className="leading-relaxed">{claim.rationale}</p>
            </div>
          )}
          {claim.evidence && (
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-foreground)]">
                Evidence
              </p>
              <p className="leading-relaxed">{claim.evidence}</p>
            </div>
          )}
          {claim.sources && claim.sources.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-foreground)]">
                Sources
              </p>
              <ul className="list-disc space-y-1 pl-4">
                {claim.sources.map((source) => (
                  <li key={source}>{source}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function EvaluationResults({ results }: EvaluationResultsProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  const metrics = computeMetrics(results.claims)

  const filteredClaims =
    statusFilter === 'ALL'
      ? results.claims
      : results.claims.filter((claim) => claim.status === statusFilter)

  const statusCounts = STATUS_ORDER.reduce(
    (counts, status) => {
      counts[status] = results.claims.filter((c) => c.status === status).length
      return counts
    },
    {} as Record<EvaluationStatus, number>
  )

  const handleExport = () => {
    const report = buildExportReport(results, metrics)
    const slug = (results.title ?? 'evaluation')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    downloadReport(report, `${slug || 'evaluation'}-report.md`)
  }

  return (
    <section className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 shadow-xl shadow-black/20">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[var(--color-accent)]" />
            <h2 className="text-lg font-medium">Claim evaluation</h2>
          </div>
          {results.title && (
            <p className="text-sm text-[var(--color-muted)]">{results.title}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-card-border)] bg-[#0d1219] px-4 py-2 text-sm font-medium transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-200/80">
            Overall score
          </p>
          <p className="mt-1 text-5xl font-semibold tabular-nums text-emerald-100">
            {metrics.supportedPct}%
          </p>
          <p className="mt-2 text-sm text-emerald-200/70">
            claims supported by evidence
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[var(--color-card-border)] bg-[#0d1219] px-4 py-3">
            <p className="text-xs text-[var(--color-muted)]">Total claims</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {metrics.total}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <p className="text-xs text-emerald-200/70">Supported</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-200">
              {metrics.supportedPct}%
            </p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="flex items-center gap-1 text-xs text-red-200/70">
              <Flag className="h-3 w-3" />
              Flagged
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-red-200">
              {metrics.flaggedPct}%
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1 text-xs text-[var(--color-muted)]">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </span>
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition',
            statusFilter === 'ALL'
              ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
              : 'border-[var(--color-card-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
          )}
        >
          All ({results.claims.length})
        </button>
        {STATUS_ORDER.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition',
              statusFilter === status
                ? STATUS_CONFIG[status].badge
                : 'border-[var(--color-card-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
            )}
          >
            {STATUS_CONFIG[status].label} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {filteredClaims.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--color-card-border)] px-4 py-8 text-center text-sm text-[var(--color-muted)]">
          No claims match this filter.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredClaims.map((claim) => (
            <ClaimRow key={claim.id} claim={claim} />
          ))}
        </div>
      )}
    </section>
  )
}
