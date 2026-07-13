import { anthropic } from '@/lib/anthropic'
import {
  guardApiRequest,
  internalErrorResponse,
  MAX_TEXT_CHARS,
  textTooLargeResponse,
} from '@/lib/api-guard'
import { loadPrompt } from '@/lib/load-prompt'
import { CLAUDE_MODEL } from '@/lib/models'

export const runtime = 'nodejs'
export const maxDuration = 60

const TEMPERATURE_CONVERSATIONAL = 0.7 as const

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatStreamRequest {
  /** Full conversation history. Last message must be from the user. */
  messages?: ChatMessage[]
  /** Legacy single-turn text. Used when messages is omitted. */
  text?: string
}

function isChatMessage(value: unknown): value is ChatMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'role' in value &&
    'content' in value &&
    ((value as ChatMessage).role === 'user' ||
      (value as ChatMessage).role === 'assistant') &&
    typeof (value as ChatMessage).content === 'string' &&
    (value as ChatMessage).content.trim().length > 0
  )
}

function resolveMessages(body: ChatStreamRequest): ChatMessage[] | null {
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    if (!body.messages.every(isChatMessage)) {
      return null
    }
    if (body.messages[body.messages.length - 1]?.role !== 'user') {
      return null
    }
    return body.messages.map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
  }

  if (typeof body.text === 'string' && body.text.trim()) {
    return [{ role: 'user', content: body.text.trim() }]
  }

  return null
}

export async function POST(request: Request): Promise<Response> {
  const blocked = guardApiRequest(request, { ai: true })
  if (blocked) {
    return blocked
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'AI service is not configured. Set ANTHROPIC_API_KEY.' },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 }
    )
  }

  if (typeof body !== 'object' || body === null) {
    return Response.json(
      { error: 'A non-empty text field or messages array is required.' },
      { status: 400 }
    )
  }

  const messages = resolveMessages(body as ChatStreamRequest)
  if (!messages) {
    return Response.json(
      {
        error:
          'Send a non-empty messages array (last message must be from the user) or a text string.',
      },
      { status: 400 }
    )
  }

  const totalChars = messages.reduce((sum, message) => sum + message.content.length, 0)
  if (totalChars > MAX_TEXT_CHARS) {
    return textTooLargeResponse('Chat history', totalChars)
  }

  try {
    const system = await loadPrompt('chat')

    const stream = anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      temperature: TEMPERATURE_CONVERSATIONAL,
      system,
      messages,
    })

    return new Response(stream.toReadableStream(), {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    return internalErrorResponse(
      'Chat stream error',
      error,
      'Failed to generate chat response. Please try again.'
    )
  }
}
