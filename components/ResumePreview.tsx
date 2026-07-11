'use client'

interface ResumePreviewProps {
  resumeText: string
}

export function ResumePreview({ resumeText }: ResumePreviewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="font-semibold text-gray-900">Resume Preview</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {resumeText ? (
          <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-mono">
            {resumeText}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <div className="text-4xl mb-3">📄</div>
              <p className="text-gray-500 text-sm">
                Your resume will appear here as you type.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
