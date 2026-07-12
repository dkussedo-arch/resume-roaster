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
}

export interface AnalyzeRequest {
  resumeText: string
  jobDescription?: string
  confirmedContext?: InferredContext
}
