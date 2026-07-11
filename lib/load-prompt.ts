import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function loadPrompt(name: string): Promise<string> {
  const path = join(process.cwd(), 'prompts', `${name}.txt`)
  return readFile(path, 'utf8')
}
