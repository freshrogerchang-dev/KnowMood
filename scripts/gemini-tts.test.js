import { describe, expect, it } from 'vitest'
import { jobsFor, promptFor, waveFromAudio } from './generate-gemini-tts.mjs'
import { appJobs, batchRequest, interactionRequest, maxSpokenSeconds, styleFor, waveFromInteraction } from './generate-app-tts.mjs'
import { EMOTION_WORDS } from '../src/data/vocabulary.js'
import { EVENT_CHIPS } from '../src/data/journal.js'
import { STICKERS } from '../src/data/stickers.js'

describe('Gemini TTS generation', () => {
  it('creates valid playable mono 24 kHz WAV from a successful Gemini PCM response', () => {
    const pcm = Buffer.alloc(9600)
    pcm.writeInt16LE(1234, 0)
    const wav = waveFromAudio([{ inlineData: { mimeType: 'audio/L16;codec=pcm;rate=24000', data: pcm.toString('base64') } }])
    expect(wav.toString('ascii', 0, 4)).toBe('RIFF')
    expect(wav.readUInt32LE(4)).toBe(wav.length - 8)
    expect(wav.readUInt32LE(24)).toBe(24000)
    expect(wav.readUInt16LE(22)).toBe(1)
    expect(wav.readUInt32LE(40)).toBe(pcm.length)
    expect(wav.subarray(44)).toEqual(pcm)
  })
  it('accepts the live Gemini MIME format with spaces and channel count', () => {
    const pcm = Buffer.alloc(9600)
    const wav = waveFromAudio([{ inlineData: { mimeType: 'audio/l16; rate=24000; channels=1', data: pcm.toString('base64') } }])
    expect(wav.subarray(44)).toEqual(pcm)
    expect(() => waveFromAudio([{ inlineData: { mimeType: 'audio/l16; rate=24000; channels=2', data: pcm.toString('base64') } }])).toThrow()
  })
  it('rejects blocked, malformed or incompatible audio instead of saving a fake WAV', () => {
    expect(() => waveFromAudio([])).toThrow()
    expect(() => waveFromAudio([{ text: 'blocked' }])).toThrow()
    expect(() => waveFromAudio([{ inlineData: { mimeType: 'audio/mp3', data: 'AAAA' } }])).toThrow()
    expect(() => waveFromAudio([{ inlineData: { mimeType: 'audio/L16;codec=pcm;rate=24000', data: 'AAAA' } }])).toThrow()
  })
  it('uses the same line across six emotions and covers all 48 distinct full-set filenames', () => {
    const sample = jobsFor(false)
    expect(sample).toHaveLength(6)
    expect(new Set(sample.map(j => j.text)).size).toBe(1)
    expect(jobsFor(true)).toHaveLength(48)
    expect(new Set(jobsFor(true).map(j => j.file)).size).toBe(48)
    for (const job of jobsFor(true)) {
      expect(promptFor(job.emotion, job.text)).toContain('台灣國語')
      expect(promptFor(job.emotion, job.text)).toContain(`台詞：${job.text}`)
    }
  })
})

describe('complete app voice replacement', () => {
  it('builds one unique output for every emotion demo and fixed narration line', () => {
    const jobs = appJobs()
    const keys = jobs.map((job) => `${job.group}/${job.file}`)
    expect(jobs.filter((job) => job.group === 'voice-emotion')).toHaveLength(48)
    expect(jobs.filter((job) => job.group === 'speech').length).toBeGreaterThan(513)
    expect(new Set(keys).size).toBe(jobs.length)
    expect(jobs.every((job) => job.text && job.prompt)).toBe(true)
  })
  it('builds a Gemini 3.8 Interactions request with verbatim text and structured Taiwanese style', () => {
    const job = { text: '我要出去了', emotion: 'happy' }
    const body = interactionRequest(job, 'gemini-3.8-flash-tts', 'Aoede')
    expect(body.input[0].content[0].text).toBe(job.text)
    expect(body.input[0].content[0].annotations[0]).toEqual({ type: 'speech_metadata', style: styleFor(job) })
    expect(body.generation_config.speech_config).toEqual([{ voice: 'Aoede' }])
    expect(styleFor(job)).toContain('台灣華語')
  })
  it('includes every previously missing fixed phrase', () => {
    const texts = new Set(appJobs().filter((job) => job.group === 'speech').map((job) => job.text))
    const missing = [
      ...Object.values(EMOTION_WORDS).flat().map((word) => word.word),
      ...EVENT_CHIPS.map((event) => event.text),
      ...STICKERS.map((sticker) => `恭喜！你得到新貼紙：${sticker.name}！`),
      '哈囉，我們來玩情緒遊戲！',
    ].filter((text) => !texts.has(text))
    expect(missing).toEqual([])
  })
  it('keeps Batch TTS speakable input strictly equal to the requested line', () => {
    const job = { text: '請看這張圖。', prompt: '這段提示絕對不能被朗讀。' }
    const body = batchRequest(job, 'Aoede')
    expect(body.contents).toEqual([{ role: 'user', parts: [{ text: job.text }] }])
    expect(JSON.stringify(body)).not.toContain(job.prompt)
  })
  it('uses a conservative duration guard to reject spoken prompt leakage', () => {
    expect(maxSpokenSeconds('好')).toBe(5)
    expect(maxSpokenSeconds('這是一段比較長的旁白內容，需要合理增加可接受的時間。')).toBeGreaterThan(10)
  })
  it('accepts only complete WAV audio from Gemini 3.8', () => {
    const wav = Buffer.alloc(1024)
    wav.write('RIFF', 0)
    wav.write('WAVE', 8)
    expect(waveFromInteraction({ output_audio: { data: wav.toString('base64') } })).toEqual(wav)
    expect(waveFromInteraction({ steps: [{ type: 'model_output', content: [{ type: 'audio', mime_type: 'audio/wav', data: wav.toString('base64') }] }] })).toEqual(wav)
    expect(() => waveFromInteraction({ output_audio: { data: Buffer.from('bad').toString('base64') } })).toThrow()
  })
})
