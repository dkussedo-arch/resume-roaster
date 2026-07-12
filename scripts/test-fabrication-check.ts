import assert from 'node:assert/strict'

import {
  applyFabricationVerification,
  extractClaims,
  verifyRewriteAgainstSource,
} from '../lib/fabrication-check'
import type { Finding } from '../lib/types'

const claims = extractClaims(
  'Increased conversion by 40% using Salesforce and AWS Lambda'
)
assert.ok(claims.some((c) => c.includes('40')))
assert.ok(claims.some((c) => /salesforce/i.test(c)))

const clean = verifyRewriteAgainstSource(
  'Led onboarding improvements for enterprise customers',
  'Led onboarding improvements for enterprise customers',
  'Full resume about onboarding'
)
assert.equal(clean.status, 'passed')

const fabricated = verifyRewriteAgainstSource(
  'Grew ARR by $2M using Snowflake',
  'Helped with reporting',
  'Helped with reporting dashboards'
)
assert.equal(fabricated.status, 'flagged_for_review')
assert.ok(fabricated.unsupportedClaims.length > 0)

const finding: Finding = {
  sourceText: 'Helped with reporting',
  category: 'level_mismatch',
  severity: 'major',
  diagnosis: 'Too weak',
  rewrite: 'Grew ARR by $2M using Snowflake',
  whyItMatters: 'Seniority signal',
  confidence: 'medium',
  fabricationCheck: 'passed',
  protectedAttributeFlag: false,
}

const verified = applyFabricationVerification([finding], 'Helped with reporting')
assert.equal(verified[0]?.fabricationCheck, 'flagged_for_review')
assert.ok((verified[0]?.fabricationNotes?.length ?? 0) > 0)

console.log('fabrication-check: all assertions passed')
