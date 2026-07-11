import type { StructuralRisk } from '@/lib/types'

const MULTI_COLUMN_PATTERNS = [
  /\|\s*\w+\s*\|/,
  /\t{2,}/,
  /(?:^|\n)\s*\S.{0,40}\s{6,}\S/m,
]

const TABLE_PATTERNS = [/<table/i, /\|[-:]+\|/]

const IMAGE_PATTERNS = [/\[image\]/i, /\[graphic\]/i, /\[photo\]/i]

const UNUSUAL_HEADER_PATTERNS = [
  /^(?:profile|summary|about me|objective)\s*$/im,
  /^(?:experience|work history|employment)\s*$/im,
]

export function runStructuralPreCheck(resumeText: string): StructuralRisk[] {
  const risks: StructuralRisk[] = []

  if (MULTI_COLUMN_PATTERNS.some((pattern) => pattern.test(resumeText))) {
    risks.push({
      issue: 'Possible multi-column layout',
      source: 'deterministic_check',
      severity: 'high',
      explanation:
        'Multi-column layouts can scramble ATS reading order. Many parsers read left-to-right across the full page width.',
    })
  }

  if (TABLE_PATTERNS.some((pattern) => pattern.test(resumeText))) {
    risks.push({
      issue: 'Table-like formatting detected',
      source: 'deterministic_check',
      severity: 'high',
      explanation:
        'Tables and pipe-delimited layouts often break ATS parsers or reorder content unpredictably.',
    })
  }

  if (IMAGE_PATTERNS.some((pattern) => pattern.test(resumeText))) {
    risks.push({
      issue: 'Image or graphic placeholder detected',
      source: 'deterministic_check',
      severity: 'major',
      explanation:
        'Text inside images is invisible to most ATS systems. Move critical content into plain text.',
    })
  }

  const lines = resumeText.split('\n').map((line) => line.trim())
  const shortLines = lines.filter((line) => line.length > 0 && line.length < 30)
  if (shortLines.length >= 6 && shortLines.length / lines.length > 0.4) {
    risks.push({
      issue: 'Unusual section header density',
      source: 'deterministic_check',
      severity: 'minor',
      explanation:
        'Many short lines can indicate non-standard headers. Use conventional section labels like Experience and Education.',
    })
  }

  if (UNUSUAL_HEADER_PATTERNS.every((pattern) => !pattern.test(resumeText))) {
    risks.push({
      issue: 'Missing conventional section headers',
      source: 'deterministic_check',
      severity: 'minor',
      explanation:
        'Standard headers (Experience, Education, Skills) help ATS classify your content correctly.',
    })
  }

  return risks
}
