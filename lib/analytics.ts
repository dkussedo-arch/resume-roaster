import posthog from 'posthog-js'

import { CLAUDE_MODEL } from '@/lib/models'

export type AiFeatureName = 'resume_analysis' | 'chat'
export type OutputRating = 'thumbs_up' | 'thumbs_down'
export type ExportFormat = 'markdown'

export function isPostHogConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY)
}

let postHogInitialized = false

export function initPostHog(): void {
  if (typeof window === 'undefined' || !isPostHogConfigured() || postHogInitialized) {
    return
  }

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,
    capture_pageleave: true,
  })

  postHogInitialized = true
}

function capture(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !isPostHogConfigured()) {
    return
  }

  posthog.capture(event, properties)
}

export function trackPageViewed(pageName: string): void {
  capture('page_viewed', { page_name: pageName })
}

export function trackFileUploaded(fileSizeKb: number, fileType: string): void {
  capture('file_uploaded', {
    file_size_kb: Math.round(fileSizeKb),
    file_type: fileType,
  })
}

export function trackAiGenerationStarted(
  featureName: AiFeatureName,
  model: string = CLAUDE_MODEL
): void {
  capture('ai_generation_started', {
    feature_name: featureName,
    model,
  })
}

export function trackAiGenerationCompleted(
  featureName: AiFeatureName,
  latencyMs: number,
  success: boolean,
  model: string = CLAUDE_MODEL
): void {
  capture('ai_generation_completed', {
    feature_name: featureName,
    model,
    latency_ms: Math.round(latencyMs),
    success,
  })
}

export function trackUserRatedOutput(rating: OutputRating): void {
  capture('user_rated_output', { rating })
}

export function trackExportClicked(exportFormat: ExportFormat): void {
  capture('export_clicked', { export_format: exportFormat })
}

export function pathnameToPageName(pathname: string): string {
  if (pathname === '/') {
    return 'home'
  }

  return pathname.replace(/^\//, '').replace(/\//g, '_') || 'unknown'
}

export { posthog }
