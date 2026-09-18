// 全部畫面的固定旁白／回饋句，預先用 Google Cloud TTS（cmn-TW-Wavenet-A）烘焙好。
// 瀏覽器內建語音（Web Speech）唸中文常常不夠自然，這裡改成播放預錄音檔；
// 語速刻意調慢、音量調大，聽起來比較穩、比較清楚。
//
// manifest.json：{ "完整句子": "s0001.mp3", ... }，key 是 speak() 收到的「完整字串」。
// 只收得到「資料是固定的」句子（情緒名稱、情境題庫、故事庫……），
// 像家人姓名、日記自訂文字這種真正動態的內容，manifest 裡找不到就會自動
// fallback 回瀏覽器語音，不會整個講不出話來。
//
// 如果之後改了 scenarios.js / stories.js / emotions.js 等資料的文字內容，
// 要重新用烘焙腳本產生 manifest 跟音檔，不然新句子就只能用瀏覽器語音唸。
import manifest from '../assets/audio/speech/manifest.json'

const files = import.meta.glob('../assets/audio/speech/*.mp3', {
  eager: true,
  import: 'default',
})

const URLS = {}
for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop()
  URLS[name] = url
}

let current = null

export function hasBakedSpeech(text) {
  return Boolean(manifest[text])
}

/** 播放預錄旁白。回傳 true 代表真的播了；false 代表沒有這句錄音，呼叫端要自己 fallback。 */
export function playBakedSpeech(text) {
  const file = manifest[text]
  const url = file && URLS[file]
  if (!url) return false
  try {
    if (current) {
      current.pause()
      current.currentTime = 0
    }
    const audio = new Audio(url)
    current = audio
    audio.play().catch(() => {})
    return true
  } catch {
    return false
  }
}

export function stopBakedSpeech() {
  if (current) {
    try { current.pause() } catch { /* noop */ }
  }
}
