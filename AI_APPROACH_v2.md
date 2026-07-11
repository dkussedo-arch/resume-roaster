# AI_APPROACH.md — v2

**Grounded in:** PRODUCT_BRIEF.md, User Research Synthesis Report, and FAILURE_MODE_ANALYSIS.md

---

## Changelog from v1

| Change | Driven by |
|---|---|
| Pattern 2 (extraction) and Pattern 3 (generation) collapsed into a single structured-output call for v1 | Simplification recommendation — reduces sequential-pipeline risk (Cascading Misread) |
| Structural ATS-risk detection moved to a deterministic, rules-based pre-check instead of model judgment | Mitigates False Authority Score |
| Pattern 4 (Classification) narrowed to a largely rules-driven routing layer, model used only for content-judgment tagging | Simplification + False Authority Score |
| Pattern 1 (Chat/Q&A) deferred past v1; replaced with static "why" explanations generated in the main pass | Simplification recommendation |
| Added: fabrication-verification pass | Mitigates Fabricated Elevation |
| Added: protected-attribute awareness layer | New edge-case coverage |
| Added: context-confirmation checkpoint between extraction and generation | Mitigates Cascading Misread |
| Added: situational tone dampening | New edge-case coverage |
| Added: regulated-field caution flag | New edge-case coverage |
| Added: explicit document-length handling | New edge-case coverage |
| Added: concrete data-handling policy | Production-safety requirement |

---

## 1. Why This Still Needs Intelligence, Not Just Automation

Unchanged from v1: the product's value is judgment — recognizing seniority mismatch, translating institutional dialects, diagnosing *why* a line reads weak — not formatting automation. What's changed is where that judgment is applied and where it's deliberately withheld in favor of deterministic checks, per the simplification recommendation in the failure mode analysis.

---

## 2. Revised Pattern Mapping

| Pattern | v2 Scope | Status |
|---|---|---|
| **2 — Document Intelligence** | Combined extraction + generation in a single structured call; deterministic structural-risk pre-check runs separately, outside the model | Core, revised |
| **4 — Classification/Routing** | Rules-driven severity routing (source-citation present, structural flags) with model contribution limited to content-judgment tags (level-mismatch, translator, tailoring-gap) | Core, narrowed |
| **3 — Content Generation** | Now folded into the single Pattern 2 call for diagnosis + rewrite; JD-tailoring delta remains a distinct generation step | Core, merged |
| **1 — Chat/Q&A** | Deferred past v1; static "why" explanations generated alongside each finding in the main pass instead | Deferred |

---

## 3. Core Analysis Pipeline (Merged Document Intelligence + Content Generation)

**Purpose:** Ingest a resume (+ optional JD), and in a single structured call, produce evidence-anchored findings *and* their rewrites together — reducing the number of sequential handoffs where context can be lost or misread.

**Flow:**
```
User uploads resume [+ optional JD]
  → Deterministic structural-risk pre-check (rules-based, non-model) — table/column/image/header detection
  → Context-confirmation checkpoint: system states its inferred target industry/seniority/role back to the user
     for a quick confirm/correct before analysis proceeds
  → Single structured-output model call:
      - extract findings (source_text-anchored)
      - classify content-judgment tags (level_mismatch / translator / tailoring_gap)
      - generate tone-calibrated diagnosis + rewrite for each finding
      - generate static "why this matters" explanation per finding
  → Fabrication-verification pass (separate, non-generative check against source facts)
  → Output: structured findings + rewrites + explanations, routed by the rules-based severity layer
```

**Why the context-confirmation checkpoint matters:** this is the direct fix for the Cascading Misread failure mode. Rather than letting an upstream misread of industry or seniority silently propagate through every downstream rewrite, the system surfaces its own assumption and lets the user correct it before generation runs on top of it.

**Structured output schema (updated):**
```json
{
  "inferred_context": {
    "target_industry": "...",
    "target_seniority": "...",
    "confirmed_by_user": true
  },
  "structural_risk": [
    {
      "issue": "two-column layout",
      "source": "deterministic_check",
      "severity": "high",
      "explanation": "..."
    }
  ],
  "findings": [
    {
      "source_text": "exact quoted bullet",
      "category": "level_mismatch | translator | tailoring_gap",
      "severity": "blocker | major | minor",
      "diagnosis": "...",
      "rewrite": "...",
      "why_it_matters": "...",
      "confidence": "high | medium | low",
      "fabrication_check": "passed | flagged_for_review",
      "protected_attribute_flag": false
    }
  ],
  "jd_delta": [
    { "jd_requirement": "...", "resume_coverage": "present | absent | mismatched_language", "note": "..." }
  ]
}
```

Two fields are new and load-bearing: `fabrication_check` and `protected_attribute_flag`. Neither is cosmetic — both gate whether a finding is safe to display as-is.

---

## 4. Fabrication-Verification Pass (New)

**Purpose:** Directly mitigate Fabricated Elevation. Self-instruction not to fabricate is necessary but insufficient, per the failure mode analysis — this is a distinct, separate check, not a re-ask of the same model with the same prompt.

**Approach:** After each rewrite is generated, run a structured comparison between the rewrite's claims (metrics, scope, entities, tools, outcomes) and the source resume text. Any claim in the rewrite that cannot be traced to something present in the source is flagged `flagged_for_review` rather than shown as a clean suggestion.

**Behavior on flag:** the finding is still shown, but visibly marked — e.g. "this rewrite may go beyond what your resume currently states; verify before using" — rather than silently blocked (which would recreate the "silence" problem from the original research) or silently accepted (which would recreate the fabrication risk).

**Special handling for sparse resumes:** when the source bullet genuinely lacks enough information to support a strong rewrite, the correct output is an honest weak rewrite plus a diagnosis that says so explicitly — not a stronger rewrite manufactured to compensate. This should be an explicit instruction in the generation prompt, directly informed by the sparse-resume edge case.

---

## 5. Protected-Attribute Awareness Layer (New)

**Purpose:** Prevent the system from ever suggesting a user cut, soften, or reframe content because it signals a protected characteristic — age (graduation year), gender or ethnicity (name, affiliations), disability (accommodation mentions), family status (parental leave gaps), or national origin/visa status.

**Approach:** A pre-pass over extracted content flags any text segment that maps to a protected-characteristic signal. Findings and rewrites are generated with an explicit constraint that these segments are out of scope for critique — the system may note that a gap exists structurally (e.g., "there's a two-year gap here") only if the user has independently flagged it as something they want addressed, and never proposes removing or obscuring it unprompted.

**Why this can't be left implicit:** general-purpose language models don't reliably self-enforce this boundary without explicit instruction and testing, per the protected-attribute edge case in the failure mode analysis. This needs to be tested directly (see Section 9) before shipping, not assumed.

---

## 6. Deterministic Structural ATS-Risk Pre-Check (Revised)

**Purpose:** Replace model-judgment-based structural risk detection with rules-based checks wherever possible, directly narrowing the False Authority Score failure mode.

**Approach:** Use document-parsing libraries to deterministically detect known parser-breaking patterns — multi-column layouts, embedded tables, images containing text, non-standard section headers, unusual fonts/encodings. These checks produce a fixed, explainable rule reference (e.g., "two-column layout detected — many ATS platforms parse columns left-to-right across the page, scrambling reading order") rather than a model-generated risk assessment.

**Where the model still contributes:** flagging content-level structural concerns that rules can't catch (e.g., an unconventional but not necessarily broken layout) — these are explicitly labeled as model-judgment, lower-confidence calls, distinct from the rules-based checks, so users can tell which is which.

**Validation requirement carried forward:** this pattern still needs testing against real ATS parser behavior (see Section 9) before its confidence labels can be trusted — moving it out of the LLM reduces hallucination risk but doesn't eliminate the need for ground-truth validation.

---

## 7. Rules-Driven Classification/Routing (Narrowed)

**Purpose:** Route findings by severity and surface order without relying on model-only judgment for the highest-stakes calls.

**Approach:**
- Severity for structural risk comes directly from the deterministic pre-check (Section 6).
- Severity for content findings is primarily driven by rule-based signals already present in the schema (does a `source_text` citation exist, is `fabrication_check` clean, is there a direct JD-requirement mismatch) with the model contributing only the qualitative category tag (level_mismatch / translator / tailoring_gap), not the severity ranking itself.
- Tone routing is now situational, not just a static preference (see Section 8).

This narrows, but doesn't eliminate, the model's role in classification — it removes the highest-uncertainty judgment calls (how severe is this, really?) from being model-only decisions.

---

## 8. Situational Tone Dampening (New)

**Purpose:** Prevent the "blunt by preference" default from becoming harmful in vulnerable contexts, per the emotionally-loaded-context edge case.

**Approach:** Independent of the user's general tone preference (blunt / constructive / gentle), the system detects situational signals — an employment gap, layoff language, career-pivot-after-setback framing — and defaults toward the "constructive but critical" register in those specific findings, regardless of the user's general setting. The user's preference still governs delivery elsewhere in the document; this is a targeted dampening, not an override of their stated preference in general.

---

## 9. Regulated-Field Caution Flag (New)

**Purpose:** Prevent rewrites from altering precise credential or licensure language in ways that change its factual/legal meaning.

**Approach:** A detection pass flags resumes containing licensure-adjacent terms (clinical, legal, aviation, financial-licensing language) and switches rewrite generation into a conservative mode for those specific bullets — phrasing and emphasis may be adjusted, but scope-of-practice or credential-status language requires explicit user confirmation before any rewrite is offered.

---

## 10. Prompt-Injection Handling (New)

**Purpose:** Treat JD text as data, not instructions, closing the injection surface identified in the failure mode analysis.

**Approach:** The system prompt explicitly frames all resume and JD content as content to be analyzed, never as instructions to follow, and output is validated against the expected structured schema rather than trusted at face value — a JD containing an embedded instruction should have no effect on the model's behavior beyond being noted (if relevant) as unusual input.

---

## 11. Document-Length Handling (New)

**Purpose:** Prevent silent truncation from recreating the "silence" failure the product is meant to solve.

**Approach:** Long documents (e.g., multi-page academic CVs) are chunked with explicit tracking of what was analyzed; if any content falls outside what was processed, the output explicitly states that, rather than presenting a complete-looking analysis that quietly omitted material.

---

## 12. Data Handling (Made Concrete)

- No user resume or JD content is used for model training.
- Documents are processed per-session; retention beyond the session requires explicit user opt-in (e.g., saving a session), with a defined deletion window otherwise.
- Any high-sensitivity identifiers incidentally present in a resume (SSNs, full home addresses) are not surfaced back in any generated output beyond what's needed for the analysis itself.

---

## 13. Deferred: Chat/Q&A (Pattern 1)

Per the simplification recommendation, live conversational follow-up is deferred past v1. In its place, each finding in the merged Pattern 2 output includes a static `why_it_matters` explanation generated in the same pass — directly addressing the research finding that users want reasoning, not just a verdict, without the added engineering and injection-risk surface of a live chat layer. Revisit post-v1 once the core pipeline's accuracy (especially fabrication-verification and structural-risk validation) is established.

---

## 14. Success Metrics (Updated)

Carried forward from v1, plus:

- **Fabrication-flag rate:** % of rewrites flagged by the verification pass — track over time; a persistently high rate signals the generation prompt needs tightening, not just the verifier.
- **Protected-attribute flag accuracy:** manually audited on a test set (Section 9 of the failure mode analysis) before launch, then spot-checked on an ongoing basis.
- **Structural-risk accuracy against real parsers:** false-positive/false-negative rate versus actual ATS platform behavior, not just user perception.
- **Context-confirmation correction rate:** how often users correct the system's inferred industry/seniority — a high correction rate signals the extraction step needs improvement even before generation is considered.

---

## 15. Remaining Open Risks

- Rules-based structural checks reduce but don't eliminate the need for real-parser validation — this remains unproven until tested against actual ATS platforms.
- The three content-judgment segments (level_mismatch / translator / tailoring_gap) are still a hypothesis from simulated research, not a validated taxonomy.
- Situational tone dampening (Section 8) relies on the model correctly detecting vulnerability signals — this itself needs dedicated testing, since a missed signal reintroduces the original harm and an over-triggered signal could feel patronizing to users who explicitly want bluntness.
- Willingness-to-pay is still unaddressed and should inform how much of the more compute-intensive fabrication-verification and context-confirmation work the product can sustain per user.
