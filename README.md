# Resume Roaster

An AI-powered resume assistant that combines ATS structural checks with evidence-anchored feedback and concrete rewrites.

## What it does

- **Deterministic ATS pre-check** — flags table/column/image patterns before AI analysis
- **Context confirmation** — confirms inferred industry/seniority before generating rewrites
- **Structured findings** — diagnoses level mismatch, jargon translation, and JD tailoring gaps
- **Concrete rewrites** — anchored to your actual bullets, with fabrication flags when needed

## Quick start

```bash
# 1. Clone
git clone https://github.com/dkussedo-arch/resume-roaster.git
cd resume-roaster

# 2. Install (pnpm recommended on Windows)
npx pnpm install

# 3. Configure
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY

# 4. Run
npx pnpm dev
```

Open **http://localhost:3000**

## Project docs

- [`PRODUCT_BRIEF.md`](./PRODUCT_BRIEF.md) — problem, users, success criteria
- [`AI_APPROACH_v2.md`](./AI_APPROACH_v2.md) — pipeline design, safety layers, deferred features

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Anthropic Claude (`claude-sonnet-4-6`)

## API

```
POST /api/analyze
Content-Type: application/json

{
  "resumeText": "...",
  "jobDescription": "...",
  "confirmedContext": {
    "targetIndustry": "Technology",
    "targetSeniority": "Senior",
    "confirmedByUser": true
  }
}
```

## Roadmap (from AI_APPROACH_v2)

- [x] Scaffold + deterministic structural pre-check
- [x] Context-confirmation checkpoint
- [x] Single structured-output analysis call
- [ ] Fabrication-verification pass (separate check)
- [ ] Protected-attribute awareness layer
- [ ] PDF/DOCX upload + parsing
- [ ] Chat/Q&A (deferred past v1)
