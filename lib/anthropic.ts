import Anthropic from '@anthropic-ai/sdk'

import { CLAUDE_MODEL } from '@/lib/models'

export { CLAUDE_MODEL }

export const TEMPERATURE_ANALYTICAL = 0.2 as const

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})
