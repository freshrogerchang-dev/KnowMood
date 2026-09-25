import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, copyFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { parseArgs } from 'node:util'
import { appJobs, maxSpokenSeconds } from './generate-app-tts.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = join(root, '.tts-output', 'elevenlabs-newgames')
const ledgerPath = join(output, 'manifest.json')
const sha = value => createHash('sha256').update(value).digest('hex')
const readJson = path => JSON.parse(readFileSync(path, 'utf8'))

export function fallbackJobs() {
  const installed = readJson(join(root, 'src/assets/audio/speech/manifest.json'))
  return appJobs().filter(job => job.group === 'speech' && !installed[job.text])
}

async function main() {
  const { values } = parseArgs({ options: { install: { type: 'boolean' }, 'dry-run': { type: 'boolean' } } })
  const jobs = fallbackJobs()
  if (values['dry-run']) {
    console.log(JSON.stringify({ total: jobs.length, characters: jobs.reduce((n, job) => n + job.text.length, 0) }, null, 2))
    return
  }
  mkdirSync(output, { recursive: true })
  const ledger = existsSync(ledgerPath) ? readJson(ledgerPath) : { provider: 'ElevenLabs', model: 'eleven_multilingual_v2', jobs: {} }
  const valid = job => {
    const entry = ledger.jobs[job.file]
    const path = join(output, job.file)
    return entry?.text === job.text && existsSync(path) && sha(readFileSync(path)) === entry.sha256
  }
  if (values.install) {
    const missing = jobs.filter(job => !valid(job))
    if (missing.length) throw new Error(`Cannot install: ${missing.length} ElevenLabs fallback files are missing or invalid`)
    const speech = readJson(join(root, 'src/assets/audio/speech/manifest.json'))
    for (const job of jobs) {
      copyFileSync(join(output, job.file), join(root, 'src/assets/audio/speech', job.file))
      speech[job.text] = job.file
    }
    writeFileSync(join(root, 'src/assets/audio/speech/manifest.json'), JSON.stringify(speech, null, 2) + '\n')
    writeFileSync(join(root, 'src/assets/audio/speech/elevenlabs-fallback-manifest.json'), JSON.stringify(ledger, null, 2) + '\n')
    console.log(`Installed ${jobs.length} temporary ElevenLabs files`)
    return
  }
  process.loadEnvFile(join(root, '.env.local'))
  const key = process.env.ELEVENLABS_API_KEY
  const voice = process.env.ELEVENLABS_VOICE_ID
  if (!key || !voice) throw new Error('Add ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID to .env.local')
  const binDir = join(root, '.tts-output', 'tools', 'imageio_ffmpeg', 'binaries')
  const ffmpeg = join(binDir, readdirSync(binDir).find(file => file.endsWith('.exe')) || 'missing')
  let completed = jobs.filter(valid).length
  console.log(`Resume ${completed}/${jobs.length}; ${jobs.length - completed} remaining`)
  for (const job of jobs.filter(item => !valid(item))) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: job.text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.42, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true } }),
      signal: AbortSignal.timeout(120000),
    })
    if (!response.ok) {
      const message = (await response.text()).replaceAll(key, '[REDACTED]')
      throw new Error(`ElevenLabs HTTP ${response.status}: ${message.slice(0, 500)}`)
    }
    const raw = join(output, `${job.file}.source.mp3`)
    const destination = join(output, job.file)
    writeFileSync(raw, Buffer.from(await response.arrayBuffer()))
    execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-19:TP=-3:LRA=11', '-ar', '24000', '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '64k', destination], { windowsHide: true, stdio: 'pipe' })
    const bytes = readFileSync(destination)
    if (bytes.length < 500) throw new Error(`Invalid audio for ${job.file}`)
    ledger.voiceId = voice
    ledger.jobs[job.file] = { file: job.file, text: job.text, sha256: sha(bytes), bytes: bytes.length, maxSpokenSeconds: maxSpokenSeconds(job.text), generatedAt: new Date().toISOString() }
    writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n')
    console.log(`${++completed}/${jobs.length} ${job.file}`)
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1 })
