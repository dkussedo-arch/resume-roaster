import { FileUploadLazy } from '@/components/file-upload-lazy'
import { ResumeAnalyzer } from '@/components/resume-analyzer'

export default function HomePage() {
  return (
    <main>
      <header className="border-b border-[var(--color-card-border)] bg-[#0b0f14]/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-sm font-bold text-[var(--color-accent)]">
              RR
            </div>
            <span className="font-medium">Resume Roaster</span>
          </div>
          <a
            href="https://github.com/dkussedo-arch/resume-roaster"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            GitHub
          </a>
        </div>
      </header>

      <FileUploadLazy />
      <ResumeAnalyzer />
    </main>
  )
}
