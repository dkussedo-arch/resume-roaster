import type { FabricationCheck, Finding } from '@/lib/types'

export interface FabricationVerification {
  status: FabricationCheck
  unsupportedClaims: string[]
}

const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'that',
  'this',
  'into',
  'over',
  'under',
  'across',
  'using',
  'used',
  'led',
  'built',
  'managed',
  'improved',
  'increased',
  'reduced',
  'created',
  'developed',
  'designed',
  'delivered',
  'team',
  'project',
  'company',
  'role',
  'work',
  'years',
  'year',
  'month',
  'months',
])

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim()
}

function containsClaim(haystack: string, claim: string): boolean {
  const h = normalize(haystack)
  const c = normalize(claim)
  if (!c) {
    return true
  }
  if (h.includes(c)) {
    return true
  }
  // Allow "40%" vs "40 percent"
  const numeric = c.replace(/%/g, ' percent').replace(/\$/g, '')
  return h.includes(numeric)
}

/** Extract measurable / entity claims that should be grounded in source text. */
export function extractClaims(rewrite: string): string[] {
  const claims = new Set<string>()

  const metricPatterns = [
    /\$?\d[\d,]*(?:\.\d+)?\s*(?:%|percent|k|m|b|million|billion)?/gi,
    /\d+\s*(?:\+|plus)?\s*(?:x|times)/gi,
  ]

  for (const pattern of metricPatterns) {
    for (const match of rewrite.matchAll(pattern)) {
      const value = match[0].trim()
      if (value.length >= 1) {
        claims.add(value)
      }
    }
  }

  // Capitalized multi-word product/tool names, e.g. "Google Cloud", "Salesforce CRM"
  for (const match of rewrite.matchAll(
    /\b([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)+)\b/g
  )) {
    claims.add(match[1])
  }

  // PascalCase product names, e.g. "Salesforce", "Kubernetes", "Snowflake"
  for (const match of rewrite.matchAll(
    /\b([A-Z][a-z]+(?:[A-Z][a-zA-Z0-9]*)+)\b/g
  )) {
    claims.add(match[1])
  }

  // Title-case single products that are not stopwords, e.g. "Salesforce"
  for (const match of rewrite.matchAll(/\b([A-Z][a-z]{3,})\b/g)) {
    const token = match[1]
    if (!STOPWORDS.has(token.toLowerCase())) {
      claims.add(token)
    }
  }

  // Acronyms / ALLCAPS tools (AWS, KPI)
  for (const match of rewrite.matchAll(/\b([A-Z]{2,}[a-zA-Z0-9]*)\b/g)) {
    const token = match[1]
    if (!STOPWORDS.has(token.toLowerCase()) && token.length >= 2) {
      claims.add(token)
    }
  }

  // Tech-looking lowercase tokens with digits or known separators
  for (const match of rewrite.matchAll(
    /\b([a-z][a-z0-9]*(?:js|sql|db)|node\.js|next\.js|react|typescript|python|java|kotlin|swift)\b/gi
  )) {
    claims.add(match[1])
  }

  return [...claims]
}

/**
 * Separate, non-generative check: any rewrite claim (metric/tool/entity)
 * that cannot be traced to the source bullet or full resume is flagged.
 */
export function verifyRewriteAgainstSource(
  rewrite: string,
  sourceText: string,
  resumeText: string
): FabricationVerification {
  const evidence = `${sourceText}\n${resumeText}`
  const unsupportedClaims = extractClaims(rewrite).filter(
    (claim) => !containsClaim(evidence, claim)
  )

  return {
    status: unsupportedClaims.length > 0 ? 'flagged_for_review' : 'passed',
    unsupportedClaims,
  }
}

export function applyFabricationVerification(
  findings: Finding[],
  resumeText: string
): Finding[] {
  return findings.map((finding) => {
    const verification = verifyRewriteAgainstSource(
      finding.rewrite,
      finding.sourceText,
      resumeText
    )

    // Conservative: if either the model or the verifier flags, keep flagged.
    const status: FabricationCheck =
      finding.fabricationCheck === 'flagged_for_review' ||
      verification.status === 'flagged_for_review'
        ? 'flagged_for_review'
        : 'passed'

    return {
      ...finding,
      fabricationCheck: status,
      fabricationNotes:
        verification.unsupportedClaims.length > 0
          ? verification.unsupportedClaims
          : finding.fabricationNotes,
    }
  })
}
