'use client'

import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            🔥 Resume Roaster
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <button className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-semibold flex items-center justify-center hover:shadow-lg transition-shadow">
            JD
          </button>
        </div>
      </div>
    </header>
  )
}
