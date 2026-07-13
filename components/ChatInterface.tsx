'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, MessageCircle, RotateCcw, Send } from 'lucide-react'

import { readAnthropicStream } from '@/lib/parse-anthropic-stream'
import {
  trackAiGenerationCompleted,
  trackAiGenerationStarted,
} from '@/lib/analytics'
import { cn } from '@/lib/utils'
import { OutputRatingButtons } from '@/components/output-rating-buttons'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2" aria-label="AI is typing">
      <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-muted)] [animation-delay:0ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-muted)] [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-muted)] [animation-delay:300ms]" />
    </div>
  )
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryHistory, setRetryHistory] = useState<ChatMessage[] | null>(null)

  const scrollAnchorRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating, error])

  const streamAssistantReply = useCallback(async (history: ChatMessage[]) => {
    setIsGenerating(true)
    setError(null)
    setRetryHistory(null)

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    const startedAt = performance.now()
    trackAiGenerationStarted('chat')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      await readAnthropicStream(response, (delta) => {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]

          if (last?.role !== 'assistant') {
            return prev
          }

          updated[updated.length - 1] = {
            role: 'assistant',
            content: last.content + delta,
          }
          return updated
        })
      })

      trackAiGenerationCompleted('chat', performance.now() - startedAt, true)
    } catch (err) {
      trackAiGenerationCompleted('chat', performance.now() - startedAt, false)
      const message =
        err instanceof Error ? err.message : 'Failed to reach the AI service.'
      setError(message)
      setRetryHistory(history)
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last?.role === 'assistant' && !last.content.trim()) {
          return prev.slice(0, -1)
        }
        return prev
      })
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || isGenerating) {
      return
    }

    const userMessage: ChatMessage = { role: 'user', content: trimmed }
    const history = [...messages, userMessage]

    setMessages(history)
    setInput('')
    void streamAssistantReply(history)
  }, [input, isGenerating, messages, streamAssistantReply])

  const handleRetry = useCallback(() => {
    if (!retryHistory || isGenerating) {
      return
    }
    void streamAssistantReply(retryHistory)
  }, [isGenerating, retryHistory, streamAssistantReply])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const showTypingIndicator =
    isGenerating &&
    (messages.length === 0 ||
      messages[messages.length - 1]?.role !== 'assistant' ||
      !messages[messages.length - 1]?.content)

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex h-[min(70vh,640px)] flex-col overflow-hidden rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] shadow-xl shadow-black/20">
        <div className="border-b border-[var(--color-card-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[var(--color-accent)]" />
            <h2 className="font-medium">Ask about your roast</h2>
          </div>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Follow up on findings, rewrites, or ATS flags — full history is sent
            each turn.
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
          {messages.length === 0 && !error && (
            <p className="text-center text-sm text-[var(--color-muted)]">
              Try: “Why was my top bullet flagged as a level mismatch?”
            </p>
          )}

          {messages.map((message, index) => {
            const isUser = message.role === 'user'
            const isLastAssistant =
              !isUser && index === messages.length - 1 && isGenerating

            return (
              <div
                key={`${message.role}-${index}-${message.content.slice(0, 24)}`}
                className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                    isUser
                      ? 'rounded-br-md bg-[var(--color-accent)] text-white'
                      : 'rounded-bl-md border border-[var(--color-card-border)] bg-[#0d1219] text-[var(--color-foreground)]'
                  )}
                >
                  {message.content}
                  {isLastAssistant && showTypingIndicator && <TypingIndicator />}
                </div>
              </div>
            )
          })}

          {isGenerating &&
            messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-[var(--color-card-border)] bg-[#0d1219] px-4 py-3">
                  <TypingIndicator />
                </div>
              </div>
            )}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              <p>{error}</p>
              {retryHistory && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isGenerating}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retry
                </button>
              )}
            </div>
          )}

          {!isGenerating &&
            !error &&
            messages.some((message) => message.role === 'assistant') && (
              <OutputRatingButtons />
            )}

          <div ref={scrollAnchorRef} />
        </div>

        <div className="border-t border-[var(--color-card-border)] p-4">
          <div className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about assumptions, findings, or rewrites…"
              rows={2}
              disabled={isGenerating}
              className="min-h-[48px] flex-1 resize-none rounded-xl border border-[var(--color-card-border)] bg-[#0d1219] px-4 py-3 text-sm outline-none ring-[var(--color-accent)] placeholder:text-[var(--color-muted)] focus:ring-2 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isGenerating || !input.trim()}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-xl bg-[var(--color-accent)] text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Press Enter to send · Shift+Enter for a new line
          </p>
        </div>
      </div>
    </section>
  )
}
