'use client'

import { useState, useRef, useEffect } from 'react'

interface WalkthroughStep {
  title: string
  description: string
  details: string[]
  icon: string
}

const steps: WalkthroughStep[] = [
  {
    title: 'Paste Your Resume',
    description: 'Copy your resume text and paste it into the input area.',
    details: [
      'Click the text area on the left panel',
      'Paste your resume from any format (PDF, Word, plain text)',
      'You can edit directly in the box',
      'Character count updates in real-time'
    ],
    icon: '📋'
  },
  {
    title: 'Add Target Job (Optional)',
    description: 'Paste the job description you\'re applying for to get role-specific feedback.',
    details: [
      'Click the "Job Description" tab',
      'Paste the job posting text',
      'Our AI will align feedback to this specific role',
      'Leave blank for generic resume analysis'
    ],
    icon: '🎯'
  },
  {
    title: 'Click Analyze Resume',
    description: 'Hit the Analyze button to start AI processing.',
    details: [
      'The button activates when your resume has content',
      'Click "Analyze Resume" button',
      'You\'ll see a loading spinner appear',
      'AI processes your resume (usually 30-60 seconds)'
    ],
    icon: '✨'
  },
  {
    title: 'AI Analyzes Your Resume',
    description: 'Our AI examines your resume against best practices.',
    details: [
      'Identifies vague or weak bullet points',
      'Flags missing metrics and quantification',
      'Checks for seniority level alignment',
      'Looks for role-specific keywords and skills'
    ],
    icon: '🤖'
  },
  {
    title: 'View Your Feedback',
    description: 'Read actionable improvements with concrete before/after examples.',
    details: [
      'Feedback appears in the right panel',
      'See specific bullets that need rewriting',
      'Get before/after examples you can copy',
      'Top 3 priorities listed for maximum impact'
    ],
    icon: '💡'
  }
]

export default function Walkthrough() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speechRate, setSpeechRate] = useState(1)
  const [isSpeechSupported, setIsSpeechSupported] = useState(false)
  const synth = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    synth.current = window.speechSynthesis
    setIsSpeechSupported(!!synth.current)
  }, [])

  const generateVoiceText = (step: WalkthroughStep): string => {
    return `${step.title}. ${step.description}. ${step.details.join('. ')}`
  }

  const handlePlayVoice = () => {
    if (!synth.current) return

    if (isPlaying) {
      synth.current.cancel()
      setIsPlaying(false)
      return
    }

    synth.current.cancel()

    const utterance = new SpeechSynthesisUtterance(generateVoiceText(steps[currentStep]))
    utterance.rate = speechRate
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    utteranceRef.current = utterance
    synth.current.speak(utterance)
    setIsPlaying(true)
  }

  const handleStopVoice = () => {
    if (synth.current) {
      synth.current.cancel()
      setIsPlaying(false)
    }
  }

  const handleNext = () => {
    handleStopVoice()
    setCurrentStep((prev) => (prev + 1) % steps.length)
  }

  const handlePrev = () => {
    handleStopVoice()
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length)
  }

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRate = parseFloat(e.target.value)
    setSpeechRate(newRate)
    if (isPlaying) {
      handleStopVoice()
    }
  }

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-4xl font-bold text-foreground mb-2 text-center">
          Interactive Walkthrough
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Follow along with text and voice guidance to get the most from Resume Roaster
        </p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-8 mb-8 border border-purple-200">
          <div className="flex items-start gap-6 mb-6">
            <div className="text-5xl">{step.icon}</div>
            <div className="flex-1">
              <h3 className="text-3xl font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                {step.description}
              </p>

              {/* Step Details */}
              <ul className="space-y-3">
                {step.details.map((detail, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-purple-600 font-bold flex-shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="text-gray-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Voice Controls */}
        {isSpeechSupported && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-3">
                <button
                  onClick={handlePlayVoice}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  aria-label={isPlaying ? 'Pause voice narration' : 'Play voice narration'}
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play Voice'}
                </button>
                <button
                  onClick={handleStopVoice}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                  aria-label="Stop voice narration"
                >
                  ⏹ Stop
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <label htmlFor="speed-select" className="text-gray-700 font-medium">
                  Speed:
                </label>
                <select
                  id="speed-select"
                  value={speechRate}
                  onChange={handleSpeedChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  aria-label="Adjust voice speed"
                >
                  <option value="0.75">0.75x (Slow)</option>
                  <option value="1">1x (Normal)</option>
                  <option value="1.25">1.25x (Fast)</option>
                  <option value="1.5">1.5x (Very Fast)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            aria-label="Go to previous step"
          >
            ← Previous
          </button>

          {/* Step Indicators */}
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  handleStopVoice()
                  setCurrentStep(idx)
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentStep ? 'bg-purple-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to step ${idx + 1}`}
                aria-current={idx === currentStep ? 'step' : undefined}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            aria-label="Go to next step"
          >
            Next →
          </button>
        </div>

        {/* Text Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            💡 <span className="font-medium">Tip:</span> Use the Previous/Next buttons or step indicators to navigate. Toggle voice narration for audio guidance.
          </p>
        </div>
      </div>
    </section>
  )
}
