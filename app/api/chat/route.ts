import { anthropic } from '@/lib/anthropic'
import { loadPrompt } from '@/lib/load-prompt'
import { CLAUDE_MODEL } from '@/lib/models'

export const runtime = 'nodejs'
export const maxDuration = 60

const TEMPERATURE_CONVERSATIONAL = 0.7 as const

export interface ChatStreamRequest {
  text: string
}

function isChatStreamRequest(body: unknown): body is ChatStreamRequest {
  return (
    typeof body === 'object' &&
    body !== null &&
    'text' in body &&
    typeof (body as ChatStreamRequest).text === 'string'
  )
}

export async function POST(request: Request): Promise<Response> {
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

  if (!isChatStreamRequest(body) || !body.text.trim()) {
    return Response.json(
      { error: 'A non-empty text field is required.' },
      { status: 400 }
    )
  }

  const text = body.text.trim()

  try {
    const system = await loadPrompt('chat')

    const stream = anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      temperature: TEMPERATURE_CONVERSATIONAL,
      system,
      messages: [{ role: 'user', content: text }],
    })

    return new Response(stream.toReadableStream(), {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown Anthropic API error'
    console.error('[Resume Roaster] Chat stream error:', message)
    return Response.json(
      { error: `Claude API request failed: ${message}` },
      { status: 500 }
    )
  }
}
