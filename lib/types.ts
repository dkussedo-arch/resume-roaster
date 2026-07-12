export type FindingCategory = 'level_mismatch' | 'translator' | 'tailoring_gap'
export type FindingSeverity = 'blocker' | 'major' | 'minor'
export type FabricationCheck = 'passed' | 'flagged_for_review'
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface InferredContext {
  targetIndustry: string
  targetSeniority: string
  confirmedByUser: boolean
}

export interface StructuralRisk {
  issue: string
  source: 'deterministic_check' | 'model_judgment'
  severity: FindingSeverity | 'high'
  explanation: string
}

export interface Finding {
  sourceText: string
  category: FindingCategory
  severity: FindingSeverity
  diagnosis: string
  rewrite: string
  whyItMatters: string
  confidence: ConfidenceLevel
  fabricationCheck: FabricationCheck
  /** Claims in the rewrite that could not be traced to the source resume. */
  fabricationNotes?: string[]
  protectedAttributeFlag: boolean
  /** Notes when a finding was limited by protected-attribute policy. */
  protectedAttributeNotes?: string[]
}

export type ProtectedAttributeCategory =
  | 'age'
  | 'gender_or_ethnicity'
  | 'disability'
  | 'family_status'
  | 'national_origin_or_visa'

export interface ProtectedAttributeSignal {
  category: ProtectedAttributeCategory
  excerpt: string
  explanation: string
}

export interface JdDelta {
  jdRequirement: string
  resumeCoverage: 'present' | 'absent' | 'mismatched_language'
  note: string
}

export interface AnalysisResult {
  inferredContext: InferredContext
  structuralRisk: StructuralRisk[]
  findings: Finding[]
  jdDelta: JdDelta[]
  protectedAttributeSignals?: ProtectedAttributeSignal[]
}

export interface AnalyzeRequest {
  resumeText: string
  jobDescription?: string
  confirmedContext?: InferredContext
}

export type EvaluationStatus =
  | 'SUPPORTED'
  | 'IMPLIED'
  | 'NOT_FOUND'
  | 'CONTRADICTED'

export interface EvaluatedClaim {
  id: string
  claim: string
  status: EvaluationStatus
  evidence?: string
  rationale?: string
  sources?: string[]
}

export interface EvaluationResult {
  title?: string
  evaluatedAt?: string
  claims: EvaluatedClaim[]
}
