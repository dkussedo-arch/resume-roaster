'use client'

import { LoadingSpinner } from './LoadingSpinner'

interface FeedbackPanelProps {
  feedback: string
  isLoading: boolean
}

export function FeedbackPanel({ feedback, isLoading }: FeedbackPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="font-semibold text-gray-900">AI Feedback</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : feedback ? (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                {feedback}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500 text-sm">
                Submit your resume to get AI-powered feedback on how to improve it.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
