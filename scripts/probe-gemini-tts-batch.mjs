import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
process.loadEnvFile(join(root, '.env.local'))
const key = process.env.GEMINI_API_KEY
if (!key) throw new Error('Missing GEMINI_API_KEY')

const model = 'gemini-3.8-flash-tts'
const jobArg = process.argv.find(arg => arg.startsWith('--job='))?.slice(6)
if (jobArg) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${jobArg}`, { headers: { 'x-goog-api-key': key } })
  const result = await response.json()
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${String(result.error?.message || 'Batch API error').replaceAll(key, '[REDACTED]')}`)
  const inline = result.dest?.inlinedResponses?.inlinedResponses || result.dest?.inlined_responses?.inlined_responses || []
  console.log(JSON.stringify({ keys: Object.keys(result), name: result.name, state: result.state || result.metadata?.state, metadata: result.metadata, responses: inline.length, responseKeys: inline[0] ? Object.keys(inline[0]) : [] }, null, 2))
  process.exit(0)
}
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:batchGenerateContent`, {
  method: 'POST',
  headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    batch: {
      display_name: `knowmood-tts-probe-${Date.now()}`,
      input_config: {
        requests: {
          requests: [{
            metadata: { key: 'probe-1' },
            request: {
              contents: [{ role: 'user', parts: [{ text: '你好' }] }],
              generation_config: {
                responseModalities: ['AUDIO'],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
              },
            },
          }],
        },
      },
    },
  }),
})
const result = await response.json()
if (!response.ok) throw new Error(`HTTP ${response.status}: ${String(result.error?.message || 'Batch API error').replaceAll(key, '[REDACTED]')}`)
console.log(JSON.stringify({ name: result.name, state: result.state, model: result.model }, null, 2))
