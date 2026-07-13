import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="text-2xl font-bold text-purple-600">
            Resume Roaster
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
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Get Real Feedback on Your Resume
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered analysis that tells you exactly what's holding you back from interviews.
          </p>
          <Link
            href="/app"
            className="inline-block rounded-lg bg-purple-600 px-8 py-3 text-lg font-semibold text-white hover:bg-purple-700 transition-colors"
          >
            Try it free
          </Link>
        </div>
      </section>
    </div>
  )
}
