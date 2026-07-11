import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              🔥 Resume Roaster
            </div>
          </div>
          <Link
            href="/app"
            className="rounded-lg bg-purple-600 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
          >
            Try it free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
            Get Real Feedback on Your Resume
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered analysis that tells you exactly what&apos;s holding you back from interviews—and how to fix it.
          </p>
          <Link
            href="/app"
            className="inline-block rounded-lg bg-purple-600 px-8 py-4 text-lg font-semibold text-white hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Try it free
          </Link>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-foreground mb-8 text-center">
            Tired of Silent Rejections?
          </h2>
          <div className="space-y-4 text-lg text-gray-700">
            <p>
              Your resume hits the ATS filter or gets skimmed in seconds, but you never know why. Friends give vague advice, expensive coaches take weeks, and generic AI tools miss what actually matters.
            </p>
            <p>
              You need specific, actionable feedback that diagnoses the real problem—not just &quot;add keywords.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            How Resume Roaster Fixes It
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Smart Analysis</h3>
              <p className="text-gray-600">
                We recognize when your bullet reads mid-level instead of senior, when it sounds like a job description, and why it would get filtered out.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Concrete Rewrites</h3>
              <p className="text-gray-600">
                Get specific before-and-after examples that show exactly how to reframe your accomplishments for the role you&apos;re targeting.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Role-Aware Feedback</h3>
              <p className="text-gray-600">
                Paste your target job description and get feedback tailored to what that specific role actually needs—not generic tips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            3 Steps to Better Interviews
          </h2>
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-lg">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  Paste Your Resume
                </h3>
                <p className="text-gray-600">
                  Upload a file or paste your resume text directly into Resume Roaster.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-lg">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  Add Target Job Details
                </h3>
                <p className="text-gray-600">
                  Optionally paste the job description to get feedback tailored to that specific role.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-lg">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  Get Specific Feedback
                </h3>
                <p className="text-gray-600">
                  Receive detailed analysis with rewritten bullets that will help you stand out to both ATS and hiring managers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Get Interview-Ready?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Stop guessing what&apos;s wrong with your resume. Get real, specific feedback in seconds.
          </p>
          <Link
            href="/app"
            className="inline-block rounded-lg bg-purple-600 px-8 py-4 text-lg font-semibold text-white hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center text-gray-600 text-sm">
          <p>&copy; 2026 Resume Roaster. Get better feedback, land better interviews.</p>
        </div>
      </footer>
    </div>
  )
}
