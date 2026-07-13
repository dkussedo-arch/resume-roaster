'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { InputPanel } from '@/components/InputPanel'
import { ResumePreview } from '@/components/ResumePreview'
import { FeedbackPanel } from '@/components/FeedbackPanel'

export default function AppPage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!resumeText) return

    setIsLoading(true)
    setFeedback('')

    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: resumeText,
          jobDescription: jobDescription || '',
        }),
      })

      const data = await response.json()
      if (data.feedback) {
        setFeedback(data.feedback)
      } else if (data.error) {
        setFeedback(
          `Error: ${data.error}\n\nPlease check your input and try again.`
        )
      }
    } catch (error) {
      console.error('Error:', error)
      setFeedback(
        'An error occurred while analyzing your resume. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />

      {/* Main dashboard layout */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full gap-px bg-gray-200">
          {/* Left Panel - Input */}
          <div className="bg-white overflow-hidden flex flex-col">
            <InputPanel
              resumeText={resumeText}
              jobDescription={jobDescription}
              onResumeChange={setResumeText}
              onJobDescChange={setJobDescription}
              isLoading={isLoading}
              onAnalyze={handleAnalyze}
            />
          </div>

          {/* Center Panel - Preview */}
          <div className="bg-white overflow-hidden flex flex-col hidden md:flex">
            <ResumePreview resumeText={resumeText} />
          </div>

          {/* Right Panel - Feedback */}
          <div className="bg-white overflow-hidden flex flex-col">
            <FeedbackPanel
              feedback={feedback}
              isLoading={isLoading}
              resumeText={resumeText}
              jobDescription={jobDescription}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
