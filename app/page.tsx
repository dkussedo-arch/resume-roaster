import Link from 'next/link'
import Walkthrough from '@/components/Walkthrough'

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

      {/* Detailed Features Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            What You&apos;ll Discover
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Feature 1 */}
            <div>
              <div className="flex items-start gap-4">
                <div className="text-2xl">✓</div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Vague vs. Impact-Driven Bullets</h3>
                  <p className="text-gray-600">
                    Identifies weak language like &quot;Worked on features&quot; and shows how to rewrite them with metrics: &quot;Reduced API latency by 40%, improving user experience for 50K+ daily active users.&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div>
              <div className="flex items-start gap-4">
                <div className="text-2xl">✓</div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Seniority Misalignment</h3>
                  <p className="text-gray-600">
                    Catches when you sound junior applying for senior roles (or vice versa). Get guidance on leadership keywords, scope, and decision-making language that matches your target level.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div>
              <div className="flex items-start gap-4">
                <div className="text-2xl">✓</div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Missing Keywords &amp; Skills</h3>
                  <p className="text-gray-600">
                    When you provide a target job description, we flag skills and keywords you didn&apos;t mention that could improve your ATS score and show role alignment.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div>
              <div className="flex items-start gap-4">
                <div className="text-2xl">✓</div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Quantification &amp; Context</h3>
                  <p className="text-gray-600">
                    Finds bullets that lack numbers, scale, or business impact. Learn how to add percentages, user counts, revenue impact, or timeline to strengthen your accomplishments.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div>
              <div className="flex items-start gap-4">
                <div className="text-2xl">✓</div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Prioritized Action Plan</h3>
                  <p className="text-gray-600">
                    Instead of vague feedback, get a ranked list of your top 3 improvements so you know exactly where to focus your effort for maximum impact.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 6 */}
            <div>
              <div className="flex items-start gap-4">
                <div className="text-2xl">✓</div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Fast &amp; Free</h3>
                  <p className="text-gray-600">
                    Get detailed AI feedback in seconds—no waiting for expensive coaches, no vague ChatGPT answers. Just actionable insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            4 Simple Steps to Better Interviews
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
                  Upload a file or paste your resume text directly into Resume Roaster. We support any format—copy and paste works perfectly.
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
                  Add Target Job Description (Optional)
                </h3>
                <p className="text-gray-600">
                  Paste the job description you&apos;re applying for. We&apos;ll analyze your resume against that specific role to catch missing skills, keywords, and alignment gaps. Want generic feedback? Skip this step.
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
                  Get AI Analysis in Seconds
                </h3>
                <p className="text-gray-600">
                  Our AI instantly analyzes your resume, identifying weak bullets, missing metrics, seniority misalignment, and keyword gaps. You&apos;ll see exactly what needs improvement.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-lg">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  Implement Concrete Rewrites
                </h3>
                <p className="text-gray-600">
                  You&apos;ll get specific before-and-after examples for your weakest bullets. Copy-paste better versions directly into your resume. Focus on the top 3 priorities for maximum impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Walkthrough Section */}
      <Walkthrough />

      {/* Testimonials Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="rounded-lg bg-white p-8 shadow-sm border border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-yellow-400">★★★★★</div>
              </div>
              <p className="text-gray-700 mb-6 italic">
                &quot;I was applying for senior roles with mid-level language and didn&apos;t even know it. Resume Roaster caught exactly what was holding me back. Got three interviews the week after I updated my bullets.&quot;
              </p>
              <div>
                <p className="font-semibold text-foreground">Sarah Chen</p>
                <p className="text-sm text-gray-600">Senior Engineer at Google</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-lg bg-white p-8 shadow-sm border border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-yellow-400">★★★★★</div>
              </div>
              <p className="text-gray-700 mb-6 italic">
                &quot;I thought my resume was fine. The feedback showed me I was describing tasks, not accomplishments. After applying the rewrites, my interview rate doubled in two weeks.&quot;
              </p>
              <div>
                <p className="font-semibold text-foreground">Marcus Johnson</p>
                <p className="text-sm text-gray-600">Product Manager at Stripe</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="rounded-lg bg-white p-8 shadow-sm border border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-yellow-400">★★★★★</div>
              </div>
              <p className="text-gray-700 mb-6 italic">
                &quot;I was rejected for &quot;not being a fit&quot; for three months. Resume Roaster showed me exactly which skills I was burying and how to highlight my experience. Now I&apos;m at a company I love.&quot;
              </p>
              <div>
                <p className="font-semibold text-foreground">Alex Rodriguez</p>
                <p className="text-sm text-gray-600">Engineering Lead at Microsoft</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">2.5x</div>
              <p className="text-gray-600">Higher interview rate after using Resume Roaster</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">&lt;60s</div>
              <p className="text-gray-600">Time to get AI feedback on your resume</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">5+</div>
              <p className="text-gray-600">Specific improvements identified per resume</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
              <p className="text-gray-600">Free—no credit card required</p>
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
