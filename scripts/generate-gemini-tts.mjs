import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { VOICE_LINES, VOICE_TONES } from '../src/data/voiceLines.js'

const root = fileURLToPath(new URL('../', import.meta.url))
export const directions = {
  happy: '開心：聲音帶笑意、輕快，音高稍高，有自然的起伏。',
  sad: '難過：失落、委屈，聲音低而慢，句尾下沉，像忍住眼淚；不要哭出聲。',
  angry: '生氣：低沉、短促、堅定有力，節奏偏快；不要尖叫或威嚇。',
  scared: '害怕：緊張不安，音高稍高、語速稍快，輕微顫抖；不要尖叫。',
  surprised: '驚訝：突然發現意料之外的事，起音明顯上揚，短暫停頓後恢復自然。',
  tired: '累了：很想睡，聲音低、語速很慢，尾音拉長，放鬆無力；不要演成悲傷。',
}
export function promptFor(emotion, text) {
  if (!directions[emotion]) throw new Error('Unknown emotion')
  return `你是同一位台灣華語配音員，正在錄製兒童情緒辨識示範。使用自然台灣國語，避免兒化音、播報腔、廣告腔和機械式逐字朗讀。保持同一人物的音色，用語調、節奏、重音傳達情緒。情緒清楚可辨，但自然、有節制。不要加背景音樂、音效、額外語助詞或情緒名稱。只朗讀台詞一次，不要朗讀指令。\n表演指示：${directions[emotion]}\n台詞：${text}`
}
function isSupportedPcm(mimeType = '') {
  const [type, ...fields] = mimeType.toLowerCase().split(';').map(s => s.trim())
  const params = Object.fromEntries(fields.map(field => field.split('=').map(s => s.trim())))
  return type === 'audio/l16' && params.rate === '24000'
    && (!params.channels || params.channels === '1')
    && (!params.codec || params.codec === 'pcm')
}
export function waveFromAudio(parts) {
  const chunks = parts.filter(p => p.inlineData).map(p => p.inlineData)
  if (!chunks.length || chunks.some(c => !isSupportedPcm(c.mimeType))) {
    throw new Error('Expected 24 kHz mono PCM audio; response was empty or unsupported')
  }
  const pcm = Buffer.concat(chunks.map(c => Buffer.from(c.data || '', 'base64')))
  if (pcm.length < 4800 || pcm.length % 2 || pcm.length > 24000 * 2 * 30) throw new Error('Invalid audio length')
  const header = Buffer.alloc(44)
  header.write('RIFF'); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVEfmt ', 8)
  header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22)
  header.writeUInt32LE(24000, 24); header.writeUInt32LE(48000, 28)
  header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34)
  header.write('data', 36); header.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([header, pcm])
}
export function jobsFor(all) {
  return Object.keys(VOICE_TONES).flatMap(emotion => (all ? VOICE_LINES : [VOICE_LINES[0]])
    .map((text, index) => ({ emotion, index, text, file: `${emotion}-${index}.wav` })))
}
async function main() {
  const { values } = parseArgs({ options: {
    resume: { type: 'boolean' }, all: { type: 'boolean' }, install: { type: 'boolean' }, 'dry-run': { type: 'boolean' },
    voice: { type: 'string', default: 'Aoede' },
    model: { type: 'string', default: 'gemini-2.5-flash-preview-tts' },
  } })
  const folder = join(root, '.tts-output', values.all || values.install ? 'full' : 'sample')
  const jobs = jobsFor(values.all || values.install)
  if (values['dry-run']) {
    console.log(JSON.stringify({ model: values.model, voice: values.voice, requests: values.install ? 0 : jobs.length, folder, jobs }, null, 2))
    return
  }
  if (values.install) {
    const manifest = JSON.parse(readFileSync(join(folder, 'manifest.json'), 'utf8'))
    if (manifest.provider !== 'Gemini TTS' || manifest.jobs.length !== jobs.length) throw new Error('Incomplete generation manifest')
    for (const job of jobs) {
      const entry = manifest.jobs.find(j => j.file === job.file && j.text === job.text && j.emotion === job.emotion)
      if (!entry) throw new Error(`Missing or stale transcript: ${job.file}`)
      const wav = readFileSync(join(folder, job.file))
      if (wav.toString('ascii', 0, 4) !== 'RIFF' || wav.toString('ascii', 8, 12) !== 'WAVE' || wav.length !== wav.readUInt32LE(40) + 44) throw new Error(`Invalid WAV: ${job.file}`)
    }
    const target = join(root, 'src/assets/audio/voice-emotion')
    for (const job of jobs) copyFileSync(join(folder, job.file), join(target, job.file))
    writeFileSync(join(target, 'gemini-manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
    console.log(`Installed ${jobs.length} Gemini files. Run npm test and npm run build.`)
    return
  }
  const envFile = join(root, '.env.local')
  if (existsSync(envFile)) process.loadEnvFile(envFile)
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('Set GEMINI_API_KEY in .env.local first. Never use a VITE_ prefix.')
  mkdirSync(folder, { recursive: true })
  // Overwrite the manifest first so an interrupted generation cannot install an older full set.
  let manifest = { provider: 'Gemini TTS', model: values.model, voice: values.voice, locale: 'zh-TW', createdAt: new Date().toISOString(), jobs: [] }
  if (values.resume && existsSync(join(folder, 'manifest.json'))) {
    const previous = JSON.parse(readFileSync(join(folder, 'manifest.json'), 'utf8'))
    if (previous.model !== values.model || previous.voice !== values.voice) throw new Error('Resume model/voice mismatch')
    manifest = previous
  }
  const save = () => writeFileSync(join(folder, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  save()
  for (const job of jobs) {
    if (manifest.jobs.some(j => j.file === job.file && j.text === job.text && j.prompt === promptFor(job.emotion, job.text)) && existsSync(join(folder, job.file))) continue
    let response
    for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(values.model)}:generateContent`, {
      method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(120000),
      body: JSON.stringify({ contents: [{ parts: [{ text: promptFor(job.emotion, job.text) }] }], generationConfig: {
        responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: values.voice } } },
      } }),
    })
    if (response.status !== 400 || attempt === 2) break
    await response.arrayBuffer()
    console.log('Retrying HTTP 400: ' + job.file)
    await new Promise(resolve => setTimeout(resolve, 1500))
    }
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}))
      const message = String(detail.error?.message || 'Check API access, quota and billing.').replaceAll(key, '[REDACTED]')
      throw new Error(`Gemini HTTP ${response.status}; stopped at ${job.file}: ${message}`)
    }
    const result = await response.json()
    const wav = waveFromAudio(result.candidates?.[0]?.content?.parts || [])
    writeFileSync(join(folder, job.file), wav)
    manifest.jobs.push({ ...job, prompt: promptFor(job.emotion, job.text) }); save()
    console.log(`${manifest.jobs.length}/${jobs.length}: ${job.file}`)
  }
  const labels = { happy: '開心', sad: '難過', angry: '生氣', scared: '害怕', surprised: '驚訝', tired: '累了' }
  const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
  writeFileSync(join(folder, 'index.html'), `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Gemini 情緒語音試聽</title><style>body{max-width:800px;margin:32px auto;padding:16px;font:20px system-ui}section{padding:16px;border-bottom:1px solid #ddd}audio{max-width:100%}</style><h1>台灣華語・情緒示範</h1><p>請檢查口音、台詞是否正確，以及同一句話的情緒能否分辨。</p>${jobs.map(j => `<section><p>${labels[j.emotion]}：${escape(j.text)}</p><audio controls preload="none" src="${j.file}"></audio></section>`).join('')}</html>`)
  console.log(`Ready to listen: ${join(folder, 'index.html')}`)
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}
