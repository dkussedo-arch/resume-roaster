import assert from 'node:assert/strict'

import {
  applyProtectedAttributeAwareness,
  detectProtectedAttributeSignals,
} from '../lib/protected-attributes'
import type { Finding } from '../lib/types'

const resume = `
Jane Doe
Graduated 2004 from State University
Requires H-1B sponsorship
She/her
Maternity leave 2022
`

const signals = detectProtectedAttributeSignals(resume)
assert.ok(signals.some((s) => s.category === 'age'))
assert.ok(signals.some((s) => s.category === 'national_origin_or_visa'))
assert.ok(signals.some((s) => s.category === 'gender_or_ethnicity'))
assert.ok(signals.some((s) => s.category === 'family_status'))

const unsafeFinding: Finding = {
  sourceText: 'Graduated 2004 from State University',
  category: 'tailoring_gap',
  severity: 'minor',
  diagnosis: 'Remove the graduation year so you do not reveal your age.',
  rewrite: 'Omit the 2004 graduation year from your education section.',
  whyItMatters: 'Age signals can bias reviewers.',
  confidence: 'high',
  fabricationCheck: 'passed',
  protectedAttributeFlag: false,
}

const { findings } = applyProtectedAttributeAwareness([unsafeFinding], resume)
assert.equal(findings[0]?.protectedAttributeFlag, true)
assert.equal(findings[0]?.rewrite, unsafeFinding.sourceText)
assert.match(findings[0]?.diagnosis ?? '', /withheld/i)

console.log('protected-attributes: all assertions passed')
