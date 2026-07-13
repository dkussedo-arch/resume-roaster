'use client'

import { useState } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface FeedbackPanelProps {
  feedback: string
  isLoading: boolean
  resumeText?: string
  jobDescription?: string
}

type PanelView = 'feedback' | 'rewritten'

export function FeedbackPanel({
  feedback,
  isLoading,
  resumeText = '',
  jobDescription = '',
}: FeedbackPanelProps) {
  const [view, setView] = useState<PanelView>('feedback')
  const [rewrittenResume, setRewrittenResume] = useState('')
  const [isRewriting, setIsRewriting] = useState(false)

  const handleRewrite = async () => {
    if (!resumeText || !feedback) return

    setIsRewriting(true)
    try {
      const response = await fetch('/api/rewrite-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: resumeText,
          feedback: feedback,
          jobDescription: jobDescription || '',
        }),
      })

      const data = await response.json()
      if (data.rewrittenResume) {
        setRewrittenResume(data.rewrittenResume)
        setView('rewritten')
      }
    } catch (error) {
      console.error('Error rewriting resume:', error)
      alert('Failed to rewrite resume. Please try again.')
    } finally {
      setIsRewriting(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rewrittenResume)
    alert('Rewritten resume copied to clipboard!')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {view === 'feedback' ? 'AI Feedback' : 'Rewritten Resume'}
          </h3>
          {feedback && (
            <div className="flex gap-2">
              <button
                onClick={() => setView('feedback')}
                className={`text-xs px-2 py-1 rounded ${
                  view === 'feedback'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Feedback
              </button>
              <button
                onClick={() => setView('rewritten')}
                disabled={!rewrittenResume}
                className={`text-xs px-2 py-1 rounded ${
                  view === 'rewritten'
                    ? 'bg-purple-600 text-white'
                    : rewrittenResume
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Rewritten
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {view === 'feedback' ? (
          <>
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
                    Submit your resume to get AI-powered feedback on how to
                    improve it.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {isRewriting ? (
              <div className="flex h-full items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : rewrittenResume ? (
              <div className="space-y-4">
                <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed font-mono bg-gray-50 p-3 rounded border border-gray-200">
                  {rewrittenResume}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <div className="text-4xl mb-3">✨</div>
                  <p className="text-gray-500 text-sm mb-4">
                    Click "Rewrite Resume" to generate an improved version based
                    on the feedback.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {feedback && view === 'feedback' && (
        <div className="border-t border-gray-200 px-4 py-3">
          <button
            onClick={handleRewrite}
            disabled={isRewriting || !resumeText}
            className="w-full bg-purple-600 text-white py-2 rounded font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isRewriting ? 'Rewriting...' : '✨ Rewrite Resume'}
          </button>
        </div>
      )}

      {rewrittenResume && view === 'rewritten' && (
        <div className="border-t border-gray-200 px-4 py-3 space-y-2">
          <button
            onClick={copyToClipboard}
            className="w-full bg-purple-600 text-white py-2 rounded font-medium hover:bg-purple-700 transition-colors"
          >
            📋 Copy to Clipboard
          </button>
          <button
            onClick={() => {
              setView('feedback')
            }}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded font-medium hover:bg-gray-200 transition-colors"
          >
            Back to Feedback
          </button>
        </div>
      )}
    </div>
  )
}
