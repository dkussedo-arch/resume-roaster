import type {
  Finding,
  ProtectedAttributeCategory,
  ProtectedAttributeSignal,
} from '@/lib/types'

export type { ProtectedAttributeCategory, ProtectedAttributeSignal }

const REMOVAL_SUGGESTION =
  /\b(remove|omit|leave out|don'?t include|hide|obscure|delete|strip|take out|exclude)\b[\s\S]{0,80}\b(year|age|graduat|gender|pronoun|visa|citizenship|photo|picture|name|disability|accommodation|maternity|paternity|parental|h-?1b|green card)\b/i

const CRITIQUE_OF_PROTECTED =
  /\b(too old|ageism|sound[s]? young|sound[s]? old|feminine|masculine|ethnic|foreign[- ]sounding|pregnant|disabled)\b/i

const DETECTORS: Array<{
  category: ProtectedAttributeCategory
  explanation: string
  patterns: RegExp[]
}> = [
  {
    category: 'age',
    explanation:
      'Age-related signals (graduation year, birth date, or explicit age) are out of scope for critique.',
    patterns: [
      /\b(?:graduat(?:ed|ion)|class of)\b[^\n.]{0,40}\b(?:19|20)\d{2}\b/gi,
      /\b(?:19|20)\d{2}\b[^\n.]{0,20}\b(?:graduat(?:ed|ion)|alumni)\b/gi,
      /\b(?:date of birth|d\.?o\.?b\.?|born in|years?\s*old)\b/gi,
      /\bage\s*[:\-]?\s*\d{1,2}\b/gi,
    ],
  },
  {
    category: 'national_origin_or_visa',
    explanation:
      'Visa / citizenship / national-origin signals are out of scope for critique or removal suggestions.',
    patterns: [
      /\b(?:h-?1b|h1b|l-?1|o-?1|tn\s+visa|opt\b|cpt\b|green card|permanent resident|work authorization|citizenship|visa status|require sponsorship|need sponsorship)\b/gi,
    ],
  },
  {
    category: 'family_status',
    explanation:
      'Family or parental-status signals are out of scope for critique or removal suggestions.',
    patterns: [
      /\b(?:maternity|paternity|parental leave|caregiver leave|family leave)\b/gi,
    ],
  },
  {
    category: 'disability',
    explanation:
      'Disability or accommodation mentions are out of scope for critique or removal suggestions.',
    patterns: [
      /\b(?:disability|disabilities|accommodation|ada\b|wheelchair|assistive)\b/gi,
    ],
  },
  {
    category: 'gender_or_ethnicity',
    explanation:
      'Gender, pronouns, or affinity-group signals are out of scope for critique or removal suggestions.',
    patterns: [
      /\b(?:she\/her|he\/him|they\/them|pronouns\s*:)\b/gi,
      /\b(?:women in|woman in|black student|hispanic|latinx|lgbtq|pride alliance|muslim student|jewish student|asian american|native american)\b[^\n.]{0,40}/gi,
    ],
  },
]

function excerptAround(text: string, matchIndex: number, matchLength: number): string {
  const start = Math.max(0, matchIndex - 24)
  const end = Math.min(text.length, matchIndex + matchLength + 24)
  return text.slice(start, end).replace(/\s+/g, ' ').trim()
}

export function detectProtectedAttributeSignals(
  resumeText: string
): ProtectedAttributeSignal[] {
  const signals: ProtectedAttributeSignal[] = []
  const seen = new Set<string>()

  for (const detector of DETECTORS) {
    for (const pattern of detector.patterns) {
      pattern.lastIndex = 0
      for (const match of resumeText.matchAll(pattern)) {
        const excerpt = excerptAround(
          resumeText,
          match.index ?? 0,
          match[0].length
        )
        const key = `${detector.category}:${excerpt.toLowerCase()}`
        if (seen.has(key)) {
          continue
        }
        seen.add(key)
        signals.push({
          category: detector.category,
          excerpt,
          explanation: detector.explanation,
        })
      }
    }
  }

  return signals
}

function textOverlapsSignal(
  text: string,
  signals: ProtectedAttributeSignal[]
): boolean {
  if (!text.trim() || signals.length === 0) {
    return false
  }

  const normalized = text.toLowerCase()
  return signals.some((signal) => {
    const excerpt = signal.excerpt.toLowerCase()
    const needle = excerpt.slice(0, Math.min(excerpt.length, 48))
    if (needle.length >= 8 && normalized.includes(needle)) {
      return true
    }

    const detector = DETECTORS.find((item) => item.category === signal.category)
    return Boolean(
      detector?.patterns.some((pattern) => {
        const clone = new RegExp(pattern.source, pattern.flags)
        return clone.test(text)
      })
    )
  })
}

function suggestsRemovalOrBias(text: string): boolean {
  return REMOVAL_SUGGESTION.test(text) || CRITIQUE_OF_PROTECTED.test(text)
}

/**
 * Enforce protected-attribute boundaries on model findings.
 * Findings that critique or rewrite protected content are marked and neutralized.
 */
export function applyProtectedAttributeAwareness(
  findings: Finding[],
  resumeText: string
): {
  findings: Finding[]
  protectedAttributeSignals: ProtectedAttributeSignal[]
} {
  const protectedAttributeSignals = detectProtectedAttributeSignals(resumeText)

  const nextFindings = findings.map((finding) => {
    const touchesProtected =
      textOverlapsSignal(finding.sourceText, protectedAttributeSignals) ||
      textOverlapsSignal(finding.diagnosis, protectedAttributeSignals) ||
      textOverlapsSignal(finding.rewrite, protectedAttributeSignals)

    const unsafeSuggestion =
      suggestsRemovalOrBias(finding.diagnosis) ||
      suggestsRemovalOrBias(finding.rewrite) ||
      suggestsRemovalOrBias(finding.whyItMatters)

    if (!touchesProtected && !unsafeSuggestion) {
      return {
        ...finding,
        protectedAttributeFlag: Boolean(finding.protectedAttributeFlag),
      }
    }

    if (unsafeSuggestion) {
      return {
        ...finding,
        protectedAttributeFlag: true,
        diagnosis:
          'This finding touched a protected-characteristic signal and was withheld from critique.',
        rewrite: finding.sourceText,
        whyItMatters:
          'Resume Roaster does not suggest removing or reframing protected-characteristic content (age, gender/ethnicity, disability, family status, or visa/national origin).',
        protectedAttributeNotes: [
          ...(finding.protectedAttributeNotes ?? []),
          'Protected-characteristic content is out of scope for critique.',
        ],
      }
    }

    // Source overlaps a protected signal, but the finding is not a removal/bias suggestion.
    return {
      ...finding,
      protectedAttributeFlag: true,
      protectedAttributeNotes: [
        ...(finding.protectedAttributeNotes ?? []),
        'Nearby protected-characteristic content is out of scope for critique.',
      ],
    }
  })

  return { findings: nextFindings, protectedAttributeSignals }
}
