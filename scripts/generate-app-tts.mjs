import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { parseArgs } from 'node:util'
import { jobsFor, promptFor, waveFromAudio, directions } from './generate-gemini-tts.mjs'
import { EMOTIONS } from '../src/data/emotions.js'
import { EMOTION_REACTIONS } from '../src/data/reactions.js'
import { TONE_CLUE } from '../src/data/voiceLines.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const sha = value => createHash('sha256').update(value).digest('hex')
const readJson = path => JSON.parse(readFileSync(path, 'utf8'))
const outputFor = model => join(root, '.tts-output', model.startsWith('gemini-3.8-') ? 'app-3.8' : 'app')
const emotionStyles = {
  tired: '疲倦想睡，但咬字仍清楚', sad: '難過委屈，情緒自然不誇張', angry: '生氣但不大吼，不嚇到孩子',
  happy: '開心喜悅，語氣明亮自然', scared: '害怕緊張，但音量平穩', surprised: '驚訝意外，帶有自然上揚語調',
}
export function styleFor(job) {
  return `自然的台灣華語口音，像溫暖有耐心的大人陪五到六歲孩子玩遊戲；${emotionStyles[job.emotion] || '親切自然、有輕微表情'}；語速清楚稍慢，避免兒化音、播報腔、廣告腔與機械式逐字朗讀；只朗讀指定文字一次，不加字、音效或背景音樂。`
}
export function interactionRequest(job, model, voice) {
  return {
    model,
    input: [{ type: 'user_input', content: [{
      type: 'text', text: job.text,
      annotations: [{ type: 'speech_metadata', style: styleFor(job) }],
    }] }],
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice }] },
  }
}
export function waveFromInteraction(result) {
  const data = result?.output_audio?.data || result?.steps
    ?.flatMap(step => step.content || [])
    .find(content => content.type === 'audio' && content.data)?.data
  if (!data) throw new Error('No audio returned by Interactions API')
  const wav = Buffer.from(data, 'base64')
  if (wav.length < 512 || wav.toString('ascii', 0, 4) !== 'RIFF' || wav.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Interactions API returned invalid WAV audio')
  }
  return wav
}
export function appJobs() {
  const speech = { ...readJson(join(root, 'src/assets/audio/speech/manifest.json')) }
  const add = text => { if (!speech[text]) speech[text] = `g-${sha(text).slice(0,16)}.mp3` }
  add('再看一次這個動作，猜猜看是什麼心情。')
  add('哈囉，我是這台裝置念故事給你聽的聲音。')
  add('我覺得開心')
  for (const e of EMOTIONS) {
    add(`對了！這是${e.name}的動作。`)
    if (TONE_CLUE[e.id]) add(`對了，他是${e.name}的聲音。${TONE_CLUE[e.id]}`)
    for (const r of EMOTION_REACTIONS[e.id]) add(`${r.text}，這是什麼心情？`)
    for (const level of ['一點點','有一些','普通','很多','非常多']) add(`你現在覺得${e.name}，${level}。我們一起做一件事，會比較舒服。`)
  }
  for (const total of [4,6,8]) for (let earned=0; earned<=total; earned++) add(`太棒了！你完成了${total}題，拿到${earned}顆星星。`)
  const narration = Object.entries(speech).map(([text,file]) => {
    const emotion = EMOTIONS.find(e => e.iSay === text)?.id
    const prompt = emotion && ['happy','sad','angry','scared','surprised','tired'].includes(emotion)
      ? promptFor(emotion,text)
      : `請用自然台灣華語朗讀以下台詞，只唸台詞一次。聲音像溫暖有耐心的大人陪孩子玩遊戲，親切自然、有輕微表情，語速清楚稍慢。避免兒化音、播報腔、廣告腔、逐字機械朗讀。不要說出指令，不要加字、音效或背景音樂。數字只唸一次、簡短乾淨。\n台詞：${text}`
    return {group:'speech',file,text,prompt}
  })
  const tones = jobsFor(true).map(j=>({...j,group:'voice-emotion',file:j.file.replace('.wav','.mp3'),prompt:promptFor(j.emotion,j.text)}))
  return [...tones,...narration]
}
export function fingerprint(job, model, voice) { return sha(JSON.stringify([job.group,job.file,job.text,job.prompt,styleFor(job),model,voice,'mp3-64k-loudnorm-v1'])) }

async function main() {
  const {values} = parseArgs({options:{install:{type:'boolean'},'dry-run':{type:'boolean'},concurrency:{type:'string',default:'2'},model:{type:'string',default:'gemini-3.8-flash-tts'},voice:{type:'string',default:'Aoede'}}})
  const jobs=appJobs()
  if(values['dry-run']) { console.log(JSON.stringify({total:jobs.length,tones:jobs.filter(j=>j.group==='voice-emotion').length,narration:jobs.filter(j=>j.group==='speech').length,characters:jobs.reduce((n,j)=>n+j.text.length,0)},null,2));return }
  const output=outputFor(values.model)
  mkdirSync(output,{recursive:true})
  const ledgerPath=join(output,'manifest.json')
  const ledger=existsSync(ledgerPath)?readJson(ledgerPath):{provider:'Gemini TTS',model:values.model,voice:values.voice,locale:'zh-TW',jobs:{}}
  if(ledger.model!==values.model||ledger.voice!==values.voice)throw new Error('Model/voice does not match existing generation folder')
  const save=()=>writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n')
  const valid=job=>{
    const entry=ledger.jobs[`${job.group}/${job.file}`]
    const file=join(output,job.group,job.file)
    return entry?.fingerprint===fingerprint(job,values.model,values.voice)&&existsSync(file)&&sha(readFileSync(file))===entry.sha256
  }
  if(values.install){
    const missing=jobs.filter(j=>!valid(j))
    if(missing.length)throw new Error(`Cannot install: ${missing.length} missing/stale/corrupt files: ${missing.slice(0,10).map(job=>`${job.group}/${job.file}`).join(', ')}`)
    // All files are validated before touching application assets.
    for(const job of jobs)copyFileSync(join(output,job.group,job.file),join(root,'src/assets/audio',job.group,job.file))
    const speech=Object.fromEntries(jobs.filter(j=>j.group==='speech').map(j=>[j.text,j.file]))
    writeFileSync(join(root,'src/assets/audio/speech/manifest.json'),JSON.stringify(speech,null,2)+'\n')
    for(const group of ['speech','voice-emotion']){
      const provenance={provider:ledger.provider,model:ledger.model,voice:ledger.voice,locale:ledger.locale,generatedAt:new Date().toISOString(),jobs:jobs.filter(j=>j.group===group).map(j=>ledger.jobs[`${j.group}/${j.file}`])}
      writeFileSync(join(root,'src/assets/audio',group,'gemini-manifest.json'),JSON.stringify(provenance,null,2)+'\n')
    }
    console.log(`Installed ${jobs.length} validated MP3 files`);return
  }
  process.loadEnvFile(join(root,'.env.local'))
  const key=process.env.GEMINI_API_KEY
  if(!key)throw new Error('Missing GEMINI_API_KEY')
  const binDir=join(root,'.tts-output/tools/imageio_ffmpeg/binaries')
  const ffmpeg=join(binDir,readdirSync(binDir).find(f=>f.endsWith('.exe'))||'missing')
  if(!existsSync(ffmpeg))throw new Error('Install imageio-ffmpeg under .tts-output/tools first')
  for(const group of ['speech','voice-emotion'])mkdirSync(join(output,group),{recursive:true})
  let completed=jobs.filter(valid).length
  const pending=jobs.filter(j=>!valid(j))
  console.log(`Resume ${completed}/${jobs.length}; ${pending.length} remaining`)
  let cursor=0, stopped=false
  const failures=[]
  async function generate(job){
    let lastError
    let concise = false
    for(let attempt=0;attempt<5;attempt++){
      try{
        const emotionStyle = emotionStyles[job.emotion]
        const compactPrompt = `用自然的台灣華語，以${emotionStyle || '溫暖親切、清楚自然'}的語氣說：${job.text}`
        const is38=values.model.startsWith('gemini-3.8-')
        const url=is38?'https://generativelanguage.googleapis.com/v1beta/interactions':`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(values.model)}:generateContent`
        const body=is38?interactionRequest(job,values.model,values.voice):{contents:[{parts:[{text:concise ? compactPrompt : job.prompt}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:values.voice}}}}}
        const response=await fetch(url,{method:'POST',headers:{'x-goog-api-key':key,'Content-Type':'application/json'},signal:AbortSignal.timeout(120000),body:JSON.stringify(body)})
        const result=await response.json()
        if(!response.ok){
          const message=String(result.error?.message||'API error').replaceAll(key,'[REDACTED]')
          const error=new Error(`HTTP ${response.status}: ${message}`)
          error.fatal=[401,403,404].includes(response.status)||/limit: 0|per.day/i.test(message)
          if(response.status===429)error.wait=30000
          throw error
        }
        const reason=result.candidates?.[0]?.finishReason
        if(reason && reason!=='STOP') {
          const error=new Error('No complete audio: '+reason)
          error.fatal=['SAFETY','PROHIBITED_CONTENT','BLOCKLIST'].includes(reason)
          if(reason==='OTHER')concise=true
          throw error
        }
        const wav=is38?waveFromInteraction(result):waveFromAudio(result.candidates?.[0]?.content?.parts||[])
        const source=join(output,job.group,job.file+'.wav')
        const destination=join(output,job.group,job.file)
        writeFileSync(source,wav)
        execFileSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',source,'-af','silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB,loudnorm=I=-19:TP=-3:LRA=11','-ar','24000','-ac','1','-codec:a','libmp3lame','-b:a','64k',destination],{windowsHide:true,stdio:'pipe'})
        const bytes=readFileSync(destination)
        if(bytes.length<500)throw new Error('Encoded audio is empty')
        const entry={...job,fingerprint:fingerprint(job,values.model,values.voice),sha256:sha(bytes),bytes:bytes.length,seconds:(wav.length-44)/48000,generatedAt:new Date().toISOString()}
        ledger.jobs[`${job.group}/${job.file}`]=entry;save()
        console.log(`${++completed}/${jobs.length} ${job.group}/${job.file}`)
        // Gemini Developer API free-tier TTS is currently limited to about
        // ten generation requests per minute. Keep this batch below that
        // ceiling so a long resume does not churn on HTTP 429 responses.
        await new Promise(resolve => setTimeout(resolve, 3500))
        return
      }catch(error){
        lastError=error
        if(error.fatal)throw error
        if(attempt<4){console.log(`Retry ${attempt+1}/4 ${job.file}: ${error.message}`);await new Promise(r=>setTimeout(r,error.wait||7000))}
      }
    }
    throw lastError
  }
  async function worker(){
    while(!stopped&&cursor<pending.length){
      const job=pending[cursor++]
      try{await generate(job)}catch(error){failures.push({file:job.file,message:error.message});console.error(`FAILED ${job.file}: ${error.message}`);if(error.fatal)stopped=true}
    }
  }
  const concurrency=Number(values.concurrency)
  if(!Number.isInteger(concurrency)||concurrency<1||concurrency>4)throw new Error('Concurrency must be 1 to 4')
  await Promise.all(Array.from({length:concurrency},worker))
  writeFileSync(join(output,'failures.json'),JSON.stringify(failures,null,2)+'\n')
  const remaining=jobs.filter(j=>!valid(j)).length
  console.log(JSON.stringify({completed:jobs.length-remaining,total:jobs.length,remaining,failures:failures.length}))
  if(remaining)process.exitCode=1
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e.message);process.exitCode=1})
