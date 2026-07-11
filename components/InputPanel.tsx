'use client'

import { useState } from 'react'

interface InputPanelProps {
  resumeText: string
  jobDescription: string
  onResumeChange: (text: string) => void
  onJobDescChange: (text: string) => void
  isLoading: boolean
  onAnalyze: () => void
}

export function InputPanel({
  resumeText,
  jobDescription,
  onResumeChange,
  onJobDescChange,
  isLoading,
  onAnalyze,
}: InputPanelProps) {
  const [activeTab, setActiveTab] = useState<'resume' | 'job'>('resume')

  return (
    <div className="flex flex-col h-full">
      {/* Tab buttons */}
      <div className="flex gap-0 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('resume')}
          className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'resume'
              ? 'text-purple-600 border-purple-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Resume
        </button>
        <button
          onClick={() => setActiveTab('job')}
          className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'job'
              ? 'text-purple-600 border-purple-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Job Description (Optional)
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'resume' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Your Resume
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => onResumeChange(e.target.value)}
                placeholder="Paste your resume text here... (or upload a file)"
                className="w-full h-72 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>
            <div className="text-xs text-gray-500">
              {resumeText.length} characters
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => onJobDescChange(e.target.value)}
                placeholder="Paste the job description here (optional - for more targeted feedback)"
                className="w-full h-72 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>
            <div className="text-xs text-gray-500">
              {jobDescription.length} characters
            </div>
          </div>
        )}
      </div>

      {/* Analyze button */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={onAnalyze}
          disabled={!resumeText || isLoading}
          className="w-full px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>
    </div>
  )
}
