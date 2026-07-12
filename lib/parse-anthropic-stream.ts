export async function readAnthropicStream(
  response: Response,
  onDelta?: (text: string) => void
): Promise<string> {
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const payload = (await response.json()) as { error?: string }
      if (payload.error) {
        message = payload.error
      }
    } catch {
      // Response body was not JSON.
    }
    throw new Error(message)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response stream available.')
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let result = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data:')) {
        continue
      }

      const data = line.slice(5).trim()
      if (!data || data === '[DONE]') {
        continue
      }

      try {
        const event = JSON.parse(data) as {
          type?: string
          delta?: { type?: string; text?: string }
        }

        if (
          event.type === 'content_block_delta' &&
          event.delta?.type === 'text_delta' &&
          event.delta.text
        ) {
          result += event.delta.text
          onDelta?.(event.delta.text)
        }
      } catch {
        // Skip malformed stream chunks.
      }
    }
  }

  return result
}
