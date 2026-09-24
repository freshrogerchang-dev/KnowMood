import { appendFileSync, closeSync, createReadStream, existsSync, mkdirSync, openSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync, writeSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { appJobs, fingerprint } from './generate-app-tts.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = join(root, '.tts-output', 'app-3.8')
const responsePath = join(output, 'batch-response.json')
const state = JSON.parse(readFileSync(join(output, 'batch-state.json'), 'utf8'))
const ledgerPath = join(output, 'manifest.json')
const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'))
const jobs = appJobs()
const model = 'gemini-3.8-flash-tts'; const voice = 'Aoede'
const sha = value => createHash('sha256').update(value).digest('hex')
const rawDir = join(output, 'batch-wav'); mkdirSync(rawDir, { recursive: true })
const binDir = join(root, '.tts-output/tools/imageio_ffmpeg/binaries')
const ffmpeg = join(binDir, readdirSync(binDir).find(file => file.endsWith('.exe')) || 'missing')
if (!existsSync(responsePath) || !existsSync(ffmpeg)) throw new Error('Missing Batch response or ffmpeg')

const audioPattern = /"inlineData"\s*:\s*\{\s*"mimeType"\s*:\s*"audio\/wav"\s*,\s*"data"\s*:\s*"/
const keyPattern = /"metadata"\s*:\s*\{\s*"key"\s*:\s*"/
let mode = 'search-audio', buffer = '', base64Remainder = '', tempPath, tempFd, extracted = 0, imported = 0
const seenKeys = new Set()

function writeBase64(text, final = false) {
  const value = base64Remainder + text
  const length = final ? value.length : value.length - (value.length % 4)
  if (length) writeSync(tempFd, Buffer.from(value.slice(0, length), 'base64'))
  base64Remainder = value.slice(length)
}
function importWav(key) {
  if (seenKeys.has(key)) { unlinkSync(tempPath); return }
  seenKeys.add(key)
  const relative = state.mapping[key]
  const job = jobs.find(candidate => `${candidate.group}/${candidate.file}` === relative)
  if (!job) throw new Error(`Unknown Batch key: ${key}`)
  const existing = ledger.jobs[relative]
  const existingPath = join(output, job.group, job.file)
  if (existing?.fingerprint === fingerprint(job, model, voice) && existsSync(existingPath) && sha(readFileSync(existingPath)) === existing.sha256) {
    unlinkSync(tempPath); return
  }
  const namedWav = join(rawDir, `${key}.wav`); renameSync(tempPath, namedWav)
  const wav = readFileSync(namedWav)
  if (wav.length < 512 || wav.toString('ascii', 0, 4) !== 'RIFF' || wav.toString('ascii', 8, 12) !== 'WAVE') throw new Error(`Invalid WAV: ${key}`)
  const folder = join(output, job.group); mkdirSync(folder, { recursive: true })
  const destination = join(folder, job.file)
  execFileSync(ffmpeg, ['-hide_banner','-loglevel','error','-y','-i',namedWav,'-af','silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB,loudnorm=I=-19:TP=-3:LRA=11','-ar','24000','-ac','1','-codec:a','libmp3lame','-b:a','64k',destination], { windowsHide: true, stdio: 'pipe' })
  const bytes = readFileSync(destination)
  ledger.jobs[relative] = { ...job, fingerprint: fingerprint(job, model, voice), sha256: sha(bytes), bytes: bytes.length, seconds: (wav.length - 44) / 48000, generatedAt: new Date().toISOString(), batch: state.name }
  imported++
  if (imported % 10 === 0) {
    writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n')
    console.log(`Imported ${imported}/${Object.keys(state.mapping).length}`)
  }
}

for await (const chunk of createReadStream(responsePath, { encoding: 'ascii', highWaterMark: 256 * 1024 })) {
  buffer += chunk
  while (true) {
    if (mode === 'search-audio') {
      const match = audioPattern.exec(buffer)
      if (!match) { buffer = buffer.slice(-256); break }
      buffer = buffer.slice(match.index + match[0].length)
      tempPath = join(rawDir, `.current-${process.pid}.wav`); if (existsSync(tempPath)) unlinkSync(tempPath)
      tempFd = openSync(tempPath, 'wx'); base64Remainder = ''; mode = 'audio'
    } else if (mode === 'audio') {
      const end = buffer.indexOf('"')
      if (end < 0) { writeBase64(buffer); buffer = ''; break }
      writeBase64(buffer.slice(0, end), true); closeSync(tempFd); extracted++
      buffer = buffer.slice(end + 1); mode = 'search-key'
    } else {
      const match = keyPattern.exec(buffer)
      if (!match) { buffer = buffer.slice(-256); break }
      const start = match.index + match[0].length; const end = buffer.indexOf('"', start)
      if (end < 0) { buffer = buffer.slice(match.index); break }
      const key = buffer.slice(start, end); buffer = buffer.slice(end + 1)
      importWav(key); mode = 'search-audio'
    }
  }
}
if (mode !== 'search-audio') throw new Error(`Incomplete streamed JSON parse in ${mode}`)
writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n')
console.log(JSON.stringify({ extracted, imported, manifestJobs: Object.keys(ledger.jobs).length, total: jobs.length }))
