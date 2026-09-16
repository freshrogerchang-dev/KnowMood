// 溫和音效：用 WebAudio 合成柔和的正弦音，避免錄音檔常見的突兀起音。
// 對聲音敏感的孩子，家長可以在設定頁整個關掉。
let ctx = null

function audio() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function tone(freq, start, dur, gain = 0.12) {
  const ac = audio()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  const t0 = ac.currentTime + start
  // 慢慢淡入淡出，不要「啪」的一聲
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.05)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

const play = (notes, settings) => {
  if (settings?.sound === false) return
  notes.forEach(([f, s, d, g]) => tone(f, s, d, g))
}

export const sfx = {
  correct: (s) => play([[523.25, 0, 0.25], [659.25, 0.12, 0.3], [783.99, 0.24, 0.45]], s),
  retry: (s) => play([[392, 0, 0.22, 0.08]], s),        // 不是「錯誤音」，只是輕輕提醒再試一次
  tap: (s) => play([[587.33, 0, 0.12, 0.06]], s),
  star: (s) => play([[659.25, 0, 0.18], [880, 0.1, 0.18], [1046.5, 0.2, 0.5]], s),
  breatheIn: (s) => play([[349.23, 0, 1.6, 0.05]], s),
  breatheOut: (s) => play([[261.63, 0, 1.6, 0.05]], s),
}
