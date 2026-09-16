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

/**
 * 唸一句話。settings.speech 關閉時直接跳過。
 * @param {string} text
 * @param {{speech?:boolean, speechRate?:number}} settings
 */
export function speak(text, settings = {}) {
  if (!text || settings.speech === false || !speechSupported()) return
  try {
    speechSynthesis.cancel() // 一次只唸一句，避免疊字造成混亂
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
