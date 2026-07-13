'use client'

import { useState } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'

import {
  trackUserRatedOutput,
  type OutputRating,
} from '@/lib/analytics'
import { cn } from '@/lib/utils'

export function OutputRatingButtons({ className }: { className?: string }) {
  const [rating, setRating] = useState<OutputRating | null>(null)

  const rate = (value: OutputRating) => {
    setRating(value)
    trackUserRatedOutput(value)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-[var(--color-muted)]">Was this helpful?</span>
      <button
        type="button"
        aria-label="Thumbs up"
        aria-pressed={rating === 'thumbs_up'}
        onClick={() => rate('thumbs_up')}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition',
          rating === 'thumbs_up'
            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200'
            : 'border-[var(--color-card-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label="Thumbs down"
        aria-pressed={rating === 'thumbs_down'}
        onClick={() => rate('thumbs_down')}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition',
          rating === 'thumbs_down'
            ? 'border-red-500/50 bg-red-500/15 text-red-200'
            : 'border-[var(--color-card-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
        )}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
