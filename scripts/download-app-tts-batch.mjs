import { createWriteStream, existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = join(root, '.tts-output', 'app-3.8')
const state = JSON.parse(readFileSync(join(output, 'batch-state-v2.json'), 'utf8'))
process.loadEnvFile(join(root, '.env.local'))
const key = process.env.GEMINI_API_KEY
if (!key) throw new Error('Missing GEMINI_API_KEY')
const destination = join(output, 'batch-response-v2.json')
if (existsSync(destination)) throw new Error('batch-response-v2.json already exists')

const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${state.name}`, {
  headers: { 'x-goog-api-key': key },
  signal: AbortSignal.timeout(30 * 60 * 1000),
})
if (!response.ok || !response.body) {
  const detail = await response.text()
  throw new Error(`HTTP ${response.status}: ${detail.slice(0, 500).replaceAll(key, '[REDACTED]')}`)
}
await pipeline(Readable.fromWeb(response.body), createWriteStream(destination, { flags: 'wx' }))
console.log(JSON.stringify({ downloaded: destination, bytes: statSync(destination).size }))
