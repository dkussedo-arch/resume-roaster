import { anthropic } from '@/lib/anthropic'
import {
  guardApiRequest,
  internalErrorResponse,
  MAX_TEXT_CHARS,
  textTooLargeResponse,
} from '@/lib/api-guard'
import { applyFabricationVerification } from '@/lib/fabrication-check'
import { loadPrompt } from '@/lib/load-prompt'
import { CLAUDE_MODEL, TEMPERATURE_ANALYTICAL } from '@/lib/models'
import { applyProtectedAttributeAwareness } from '@/lib/protected-attributes'
import { runStructuralPreCheck } from '@/lib/structural-check'
import type {
  AnalysisResult,
  AnalyzeRequest,
  FabricationCheck,
  Finding,
  FindingCategory,
  FindingSeverity,
  InferredContext,
  JdDelta,
  StructuralRisk,
} from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

function parseCategory(value: unknown): FindingCategory {
  if (
    value === 'level_mismatch' ||
    value === 'translator' ||
    value === 'tailoring_gap'
  ) {
    return value
  }
  return 'tailoring_gap'
}

function parseSeverity(value: unknown): FindingSeverity {
  if (value === 'blocker' || value === 'major' || value === 'minor') {
    return value
  }
  return 'minor'
}

function parseFabricationCheck(value: unknown): FabricationCheck {
  return value === 'flagged_for_review' ? 'flagged_for_review' : 'passed'
}

function normalizeResult(
  payload: Record<string, unknown>,
  structuralRisk: StructuralRisk[]
): AnalysisResult {
  const inferred = (payload.inferred_context ?? {}) as Record<string, unknown>
  const inferredContext: InferredContext = {
    targetIndustry:
      typeof inferred.target_industry === 'string'
        ? inferred.target_industry
        : 'Unknown',
    targetSeniority:
      typeof inferred.target_seniority === 'string'
        ? inferred.target_seniority
        : 'Unknown',
    confirmedByUser: Boolean(inferred.confirmed_by_user),
  }

  const findingsRaw = Array.isArray(payload.findings) ? payload.findings : []
  const findings: Finding[] = findingsRaw.map((item) => {
    const finding = item as Record<string, unknown>
    return {
      sourceText:
        typeof finding.source_text === 'string' ? finding.source_text : '',
      category: parseCategory(finding.category),
      severity: parseSeverity(finding.severity),
      diagnosis:
        typeof finding.diagnosis === 'string' ? finding.diagnosis : '',
      rewrite: typeof finding.rewrite === 'string' ? finding.rewrite : '',
      whyItMatters:
        typeof finding.why_it_matters === 'string' ? finding.why_it_matters : '',
      confidence:
        finding.confidence === 'high' || finding.confidence === 'low'
          ? finding.confidence
          : 'medium',
      fabricationCheck: parseFabricationCheck(finding.fabrication_check),
      protectedAttributeFlag: Boolean(finding.protected_attribute_flag),
    }
  })

  const jdDeltaRaw = Array.isArray(payload.jd_delta) ? payload.jd_delta : []
  const jdDelta: JdDelta[] = jdDeltaRaw.map((item) => {
    const delta = item as Record<string, unknown>
    const coverage = delta.resume_coverage
    return {
      jdRequirement:
        typeof delta.jd_requirement === 'string' ? delta.jd_requirement : '',
      resumeCoverage:
        coverage === 'present' ||
        coverage === 'absent' ||
        coverage === 'mismatched_language'
          ? coverage
          : 'absent',
      note: typeof delta.note === 'string' ? delta.note : '',
    }
  })

  return {
    inferredContext,
    structuralRisk,
    findings,
    jdDelta,
  }
}

export async function POST(request: Request): Promise<Response> {
  const blocked = guardApiRequest(request, { ai: true })
  if (blocked) {
    return blocked
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'AI service is not configured. Set ANTHROPIC_API_KEY.' },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 }
    )
  }

  const payload = body as AnalyzeRequest
  const resumeText = payload.resumeText?.trim() ?? ''
  const jobDescription = payload.jobDescription?.trim() ?? ''

  if (!resumeText) {
    return Response.json({ error: 'Resume text is required.' }, { status: 400 })
  }

  if (resumeText.length > MAX_TEXT_CHARS) {
    return textTooLargeResponse('Resume text', resumeText.length)
  }

  if (jobDescription.length > MAX_TEXT_CHARS) {
    return textTooLargeResponse('Job description', jobDescription.length)
  }

  const structuralRisk = runStructuralPreCheck(resumeText)

  try {
    const systemPrompt = await loadPrompt('analyze')
    const userContent = [
      '## Resume',
      resumeText,
      jobDescription ? '\n## Target job description\n' + jobDescription : '',
      payload.confirmedContext
        ? '\n## User-confirmed context\n' +
          JSON.stringify(
            {
              target_industry: payload.confirmedContext.targetIndustry,
              target_seniority: payload.confirmedContext.targetSeniority,
            },
            null,
            2
          )
        : '',
    ].join('\n')

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      temperature: TEMPERATURE_ANALYTICAL,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from model.')
    }

    const parsed = JSON.parse(textBlock.text) as Record<string, unknown>
    const result = normalizeResult(parsed, structuralRisk)
    result.findings = applyFabricationVerification(result.findings, resumeText)

    const protectedLayer = applyProtectedAttributeAwareness(
      result.findings,
      resumeText
    )
    result.findings = protectedLayer.findings
    result.protectedAttributeSignals = protectedLayer.protectedAttributeSignals

    return Response.json(result)
  } catch (error) {
    return internalErrorResponse(
      'Analyze error',
      error,
      'Failed to analyze resume. Please try again.'
    )
  }
}
