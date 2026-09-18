// 「聲音裡的情緒」的預錄音檔（Google Cloud TTS，cmn-TW-Wavenet-A）。
//
// 瀏覽器內建語音（Web Speech）唸中文常常不夠自然，這個遊戲又是靠孩子反覆
// 聽好幾次來抓語氣差異，音質特別重要，所以改用預先烘焙好的音檔。
// pitch/rate 跟 voiceLines.js 的 VOICE_TONES 用同一組數值換算成 SSML 產生，
// 保留原本「用聲音區分情緒」的誇張語調設計。
//
// 檔名對應 `${emotionId}-${lineIndex}`，lineIndex 是 VOICE_LINES 陣列的索引。
// 如果之後改了 VOICE_LINES 的內容或順序，要重新用腳本烘焙音檔。
const files = import.meta.glob('../assets/audio/voice-emotion/*.mp3', {
  eager: true,
  import: 'default',
})

const AUDIO_URLS = {}
for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop().replace('.mp3', '')
  AUDIO_URLS[name] = url
}

export function recordedToneUrl(emotionId, lineIndex) {
  return AUDIO_URLS[`${emotionId}-${lineIndex}`] || null
}

let current = null

/** 播放預錄音檔，會先停掉上一個還在播的。回傳 false 代表播放失敗（呼叫端可以 fallback）。 */
export function playRecordedTone(url, volume = 1) {
  try {
    if (current) {
      current.pause()
      current.currentTime = 0
    }
    const audio = new Audio(url)
    audio.volume = Math.max(0, Math.min(1, volume))
    current = audio
    audio.play().catch(() => {})
    return true
  } catch {
    return false
  }
}

export function stopRecordedTone() {
  if (current) {
    try { current.pause() } catch { /* noop */ }
  }
}
