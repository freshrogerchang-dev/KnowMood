import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { appJobs, batchRequest, fingerprint, maxSpokenSeconds } from './generate-app-tts.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = join(root, '.tts-output', 'app-3.8')
const statePath = join(output, 'batch-state-v3.json')
const ledgerPath = join(output, 'manifest.json')
const model = 'gemini-3.8-flash-tts'
const voice = 'Aoede'
const sha = value => createHash('sha256').update(value).digest('hex')
const readJson = path => JSON.parse(readFileSync(path, 'utf8'))

process.loadEnvFile(join(root, '.env.local'))
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) throw new Error('Missing GEMINI_API_KEY')
mkdirSync(output, { recursive: true })
const ledger = existsSync(ledgerPath) ? readJson(ledgerPath) : { provider: 'Gemini TTS', model, voice, locale: 'zh-TW', jobs: {} }
if (ledger.model !== model || ledger.voice !== voice) throw new Error('Model/voice mismatch')
const jobs = appJobs()
const valid = job => {
  const entry = ledger.jobs[`${job.group}/${job.file}`]
  const file = join(output, job.group, job.file)
  return entry?.fingerprint === fingerprint(job, model, voice) && entry.seconds <= maxSpokenSeconds(job.text) && existsSync(file) && sha(readFileSync(file)) === entry.sha256
}
const headers = { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' }

async function submit() {
  if (existsSync(statePath)) throw new Error('batch-state-v3.json already exists; collect or archive it after inspection')
  const pending = jobs.filter(job => !valid(job))
  if (!pending.length) return console.log('All files are already complete')
  const mapping = Object.fromEntries(pending.map((job, index) => [`b${String(index).padStart(4, '0')}`, `${job.group}/${job.file}`]))
  const requests = pending.map((job, index) => ({
    metadata: { key: `b${String(index).padStart(4, '0')}` },
    // Batch generateContent has no structured speech_metadata field. Sending
    // prose directions here makes TTS occasionally speak those directions.
    // Keep the speakable input strictly equal to the requested line.
    request: batchRequest(job, voice),
  }))
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:batchGenerateContent`, {
    method: 'POST', headers, signal: AbortSignal.timeout(120000),
    body: JSON.stringify({ batch: { display_name: `knowmood-tts-${Date.now()}`, input_config: { requests: { requests } } } }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${String(result.error?.message || 'Batch submit failed').replaceAll(apiKey, '[REDACTED]')}`)
  writeFileSync(statePath, JSON.stringify({ name: result.name, model, voice, submittedAt: new Date().toISOString(), mapping }, null, 2) + '\n')
  console.log(JSON.stringify({ name: result.name, submitted: pending.length }))
}

async function collect() {
  if (!existsSync(statePath)) throw new Error('No batch-state-v3.json; submit first')
  const state = readJson(statePath)
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${state.name}`, { headers: { 'x-goog-api-key': apiKey } })
  const result = await response.json()
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${String(result.error?.message || 'Batch lookup failed').replaceAll(apiKey, '[REDACTED]')}`)
  const batchState = result.metadata?.state
  const stats = result.metadata?.batchStats || {}
  if (batchState !== 'BATCH_STATE_SUCCEEDED') {
    console.log(JSON.stringify({ name: state.name, state: batchState, stats }))
    if (['BATCH_STATE_FAILED','BATCH_STATE_CANCELLED','BATCH_STATE_EXPIRED'].includes(batchState)) process.exitCode = 1
    return
  }
  const responses = result.metadata?.output?.inlinedResponses?.inlinedResponses || []
  const binDir = join(root, '.tts-output/tools/imageio_ffmpeg/binaries')
  const ffmpeg = join(binDir, readdirSync(binDir).find(file => file.endsWith('.exe')) || 'missing')
  if (!existsSync(ffmpeg)) throw new Error('Missing ffmpeg')
  let imported = 0
  const failures = []
  for (const item of responses) {
    const key = item.metadata?.key
    const relative = state.mapping[key]
    const job = jobs.find(candidate => `${candidate.group}/${candidate.file}` === relative)
    const inline = item.response?.candidates?.[0]?.content?.parts?.find(part => part.inlineData)?.inlineData
    if (!job || !inline?.data) { failures.push({ key, error: item.error || 'Missing audio' }); continue }
    const wav = Buffer.from(inline.data, 'base64')
    if (wav.length < 512 || wav.toString('ascii', 0, 4) !== 'RIFF' || wav.toString('ascii', 8, 12) !== 'WAVE') { failures.push({ key, error: 'Invalid WAV' }); continue }
    const folder = join(output, job.group); mkdirSync(folder, { recursive: true })
    const source = join(folder, `${job.file}.wav`); const destination = join(folder, job.file)
    writeFileSync(source, wav)
    execFileSync(ffmpeg, ['-hide_banner','-loglevel','error','-y','-i',source,'-af','silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB,loudnorm=I=-19:TP=-3:LRA=11','-ar','24000','-ac','1','-codec:a','libmp3lame','-b:a','64k',destination], { windowsHide: true, stdio: 'pipe' })
    const bytes = readFileSync(destination)
    ledger.jobs[relative] = { ...job, fingerprint: fingerprint(job, model, voice), sha256: sha(bytes), bytes: bytes.length, seconds: (wav.length - 44) / 48000, generatedAt: new Date().toISOString(), batch: state.name }
    imported++
  }
  writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n')
  writeFileSync(join(output, 'batch-failures.json'), JSON.stringify(failures, null, 2) + '\n')
  const completed = jobs.filter(valid).length
  console.log(JSON.stringify({ name: state.name, imported, failures: failures.length, completed, total: jobs.length }))
  if (failures.length) process.exitCode = 1
}

async function check() {
  if (!existsSync(statePath)) throw new Error('No batch-state-v3.json; submit first')
  const state = readJson(statePath)
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${state.name}`, { headers: { 'x-goog-api-key': apiKey } })
  if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}: Batch lookup failed`)
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let prefix = ''
  while (prefix.length < 2 * 1024 * 1024) {
    const { value, done } = await reader.read(); if (done) break
    prefix += decoder.decode(value, { stream: true })
    const match = prefix.match(/"state"\s*:\s*"(BATCH_STATE_[A-Z_]+)"/)
    if (match) { await reader.cancel(); console.log(JSON.stringify({ name: state.name, state: match[1] })); return }
  }
  await reader.cancel(); throw new Error('Batch state was not found in the response prefix')
}

const command = process.argv[2]
if (command === '--submit') await submit()
else if (command === '--collect') await collect()
else if (command === '--check') await check()
else throw new Error('Use --submit, --check or --collect')
