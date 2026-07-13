import Anthropic from '@anthropic-ai/sdk'

function createAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const heliconeKey = process.env.HELICONE_API_KEY?.trim()

  if (heliconeKey) {
    return new Anthropic({
      apiKey,
      baseURL: 'https://anthropic.helicone.ai',
      defaultHeaders: {
        'Helicone-Auth': `Bearer ${heliconeKey}`,
      },
    })
  }

  return new Anthropic({ apiKey })
}

export const anthropic = createAnthropicClient()
