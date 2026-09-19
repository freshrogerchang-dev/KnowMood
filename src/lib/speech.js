// 語音朗讀（Web Speech API）。5-6 歲多半還不識字，所有題目都要能唸出來。
import { playBakedSpeech, stopBakedSpeech } from './bakedSpeech'

let voice = null
let voicesReady = false

// 幫每個候選語音打分數，分數愈高愈自然。
//
// Web Speech 沒有給「這是不是神經網路合成」的旗標，只能用命名猜：
// - iOS/macOS 內建的中文語音本身就是類神經網路合成，音質最好，直接是 zh-TW。
// - Android/Chrome 的 "Google 國語（臺灣）" 是雲端合成，比系統內建的 espeak 好非常多。
// - 名字裡有 Enhanced/Premium/Natural 通常代表廠商自己標的高音質版本。
// - localService === false 在 Chrome 上大多代表雲端合成（更自然，但要連網路），
//   在其他瀏覽器意義不一定一樣，所以只當作加分，不當唯一依據。
function scoreVoice(v) {
  let score = 0
  if (v.lang === 'zh-TW') score += 100
  else if (/^zh[-_]?(TW|Hant|HK)/i.test(v.lang)) score += 70
  else if (/^zh/i.test(v.lang)) score += 40
  else return -1 // 不是中文，直接淘汰

  if (/google/i.test(v.name)) score += 20
  if (/enhanced|premium|natural|neural|hd/i.test(v.name)) score += 15
  if (v.localService === false) score += 5
  return score
}

function pickVoice() {
  if (typeof speechSynthesis === 'undefined') return null
  const all = speechSynthesis.getVoices()
  if (!all.length) return null
  voicesReady = true
  const ranked = all
    .map((v) => ({ v, score: scoreVoice(v) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
  return ranked[0]?.v || null
}

/** 目前選到的語音名稱，讓家長設定頁可以顯示「用的是哪個聲音」方便排查。 */
export function currentVoiceLabel() {
  if (!speechSupported()) return null
  if (!voicesReady) voice = pickVoice()
  return voice?.name || null
}

if (typeof speechSynthesis !== 'undefined') {
  voice = pickVoice()
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    voice = pickVoice()
  })
}

export const speechSupported = () => typeof speechSynthesis !== 'undefined'

// ---------------------------------------------------------------------------
// iOS 解鎖
//
// iOS Safari 規定 speechSynthesis 的「第一次」發聲必須發生在使用者的觸控事件裡，
// 否則會被靜默擋掉。App 一開啟自動唸的問候語因此在 iPad 上不會出聲，
// 而且在某些版本上還會讓之後所有的朗讀一起失效。
//
// 作法：在第一次觸控時送出一個只有空白字元的 utterance 把引擎叫醒，
// 之後整個 session 的朗讀就都正常了。空白字元本身不會發出任何聲音。
// ---------------------------------------------------------------------------
let unlocked = false
let unlockInstalled = false

export const speechUnlocked = () => unlocked

export function installSpeechUnlock() {
  if (!speechSupported() || unlocked || unlockInstalled) return
  unlockInstalled = true

  const done = () => {
    document.removeEventListener('pointerdown', unlock, true)
    document.removeEventListener('touchend', unlock, true)
  }

  const unlock = () => {
    if (unlocked) return done()
    unlocked = true
    try {
      const u = new SpeechSynthesisUtterance(' ') // 空白：叫醒引擎但不出聲
      u.volume = 0
      u.lang = voice?.lang || 'zh-TW'
      if (voice) u.voice = voice
      speechSynthesis.speak(u)
    } catch {
      /* 不支援就算了，不影響遊戲 */
    }
    done()
  }

  // capture 階段：確保在 React 的 onClick 之前就解鎖，
  // 這樣按鈕自己要唸的那句話才來得及發出去。
  document.addEventListener('pointerdown', unlock, true)
  document.addEventListener('touchend', unlock, true)
}

/**
 * 唸一句話。settings.speech 關閉時直接跳過。
 * @param {string} text
 * @param {{speech?:boolean, speechRate?:number}} settings
 */
export function speak(text, settings = {}) {
  if (!text || settings.speech === false || !speechSupported()) return
  try {
    speechSynthesis.cancel() // 一次只唸一句，避免疊字造成混亂
    // iOS 從背景切回來時 speechSynthesis 可能卡在暫停狀態
    if (speechSynthesis.paused) speechSynthesis.resume()
    if (!voicesReady) voice = pickVoice()
    const u = new SpeechSynthesisUtterance(String(text))
    u.lang = voice?.lang || 'zh-TW'
    if (voice) u.voice = voice
    u.rate = settings.speechRate ?? 0.82 // 比正常語速慢一點，方便還不太識字的孩子聽懂
    u.pitch = 1 // 用語音引擎原本設計的音高，不做人工變調，才不會聽起來金屬感很重
    u.volume = 1
    speechSynthesis.speak(u)
  } catch {
    /* 瀏覽器不支援就靜靜略過 */
  }
}

/**
 * 唸一句話，優先播放預先烘焙好的 Google TTS 音檔（比瀏覽器語音自然、也比較大聲），
 * 找不到對應的錄音才 fallback 回 speak()（瀏覽器語音）。
 *
 * 用在畫面固定的旁白／回饋句；像「試聽目前語速」這種要即時反映使用者調整的
 * speechRate 設定值的地方，要繼續呼叫 speak()，不能用這個（烘焙音檔的語速是固定的）。
 * @param {string} text
 * @param {{speech?:boolean, speechRate?:number}} settings
 */
export function speakSmart(text, settings = {}) {
  if (!text || settings.speech === false) return
  if (playBakedSpeech(text)) return
  speak(text, settings)
}

/**
 * 用指定的語調唸一句話（「聲音裡的情緒」用）。
 *
 * ⚠️ 限制：Web Speech 只給得到 pitch / rate / volume 三個旋鈕，
 * 而且不同語音引擎對 pitch 的支援差很多 —— 有些 voice 會直接忽略。
 * 所以這裡的參數是刻意拉開的「誇張版」語調，不是自然說話的樣子。
 * iOS/macOS 內建的 zh-TW 語音表現最好。
 *
 * @param {string} text
 * @param {{pitch:number, rate:number, volume?:number}} tone
 */
export function speakWithTone(text, tone, settings = {}) {
  if (!text || settings.speech === false || !speechSupported()) return
  try {
    speechSynthesis.cancel()
    if (speechSynthesis.paused) speechSynthesis.resume()
    if (!voicesReady) voice = pickVoice()
    const u = new SpeechSynthesisUtterance(String(text))
    u.lang = voice?.lang || 'zh-TW'
    if (voice) u.voice = voice
    u.pitch = Math.max(0, Math.min(2, tone.pitch))
    u.rate = Math.max(0.1, Math.min(10, tone.rate))
    u.volume = tone.volume ?? 1
    speechSynthesis.speak(u)
  } catch {
    /* noop */
  }
}

export function stopSpeaking() {
  stopBakedSpeech()
  if (speechSupported()) {
    try { speechSynthesis.cancel() } catch { /* noop */ }
  }
}
