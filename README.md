# Resume Roaster

An AI-powered resume assistant that combines ATS structural checks with evidence-anchored feedback and concrete rewrites.

## What it does

- **Deterministic ATS pre-check** — flags table/column/image patterns before AI analysis
- **PDF / DOCX upload** — extract resume text in-browser and store the file in Supabase Storage
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

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth-ready clients + Storage)
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

```
POST /api/upload
Content-Type: multipart/form-data

file: <resume.pdf|resume.docx>
```

Returns storage metadata. Text is extracted in the browser (PDF via pdf.js, DOCX via mammoth) before upload.

```
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Why was this bullet flagged?" },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "Can you suggest a safer rewrite?" }
  ]
}
```

Also accepts legacy `{ "text": "..." }` for single-turn requests. Returns an Anthropic SSE stream.

## Environment (deploy)

Set on your host (Vercel, etc.):

- `ANTHROPIC_API_KEY` (required)
- `RR_API_SECRET` (required for cross-origin API access in production)
- `HELICONE_API_KEY` (optional LLM observability)
- Supabase vars as in `.env.example` (optional until you enable Storage)

Same-origin browser calls from this app do not need `RR_API_SECRET`. Cross-origin clients must send `Authorization: Bearer <RR_API_SECRET>` or `x-api-key`.

## Supabase Storage setup

1. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
2. Create a private bucket named `resumes` (or set `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`)
3. Optional SQL helper: [`supabase/storage-resumes.sql`](./supabase/storage-resumes.sql)

## Roadmap (from AI_APPROACH_v2)

- [x] Scaffold + deterministic structural pre-check
- [x] Context-confirmation checkpoint
- [x] Single structured-output analysis call
- [x] Fabrication-verification pass (separate check)
- [x] PDF upload + Supabase Storage
- [x] DOCX upload + parsing
- [x] Protected-attribute awareness layer
- [x] Streaming chat follow-up (`POST /api/chat`)
- [x] Chat UI wired into home page (`ChatInterface`)
- [ ] Optional: pass roast findings into chat context automatically
