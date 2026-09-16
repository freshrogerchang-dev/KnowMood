// 語音朗讀（Web Speech API）。5-6 歲多半還不識字，所有題目都要能唸出來。
let voice = null
let voicesReady = false

function pickVoice() {
  if (typeof speechSynthesis === 'undefined') return null
  const all = speechSynthesis.getVoices()
  if (!all.length) return null
  voicesReady = true
  // 優先台灣中文，其次任何中文
  return (
    all.find((v) => v.lang === 'zh-TW') ||
    all.find((v) => /^zh[-_]?(TW|Hant|HK)/i.test(v.lang)) ||
    all.find((v) => /^zh/i.test(v.lang)) ||
    null
  )
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
    u.rate = settings.speechRate ?? 0.85 // 比正常語速稍慢
    u.pitch = 1.05
    u.volume = 1
    speechSynthesis.speak(u)
  } catch {
    /* 瀏覽器不支援就靜靜略過 */
  }
}

export function stopSpeaking() {
  if (speechSupported()) {
    try { speechSynthesis.cancel() } catch { /* noop */ }
  }
}
