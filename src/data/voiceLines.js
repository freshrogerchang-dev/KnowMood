// 「聲音裡的情緒」
//
// 語調辨識（prosody）是 ASD 很核心的困難之一 —— 同一句話用不同語氣說，
// 意思完全不同，但這個線索常常接收不到。市面上的情緒 App 幾乎沒有做這塊。
//
// 句子刻意選「中性」的：光看字看不出心情，只能靠聲音判斷。
// 不能用「我好開心」這種自己就把答案講出來的句子。
export const VOICE_LINES = [
  '我要出去了',
  '這個給你',
  '你看那邊',
  '等一下',
  '我知道了',
  '換你了',
  '走吧',
  '是這樣喔',
]

// Web Speech 只有 pitch / rate / volume 三個旋鈕，所以這些是刻意誇張的版本。
// 沒有列在這裡的情緒（害羞、驚訝以外的細緻情緒）不會出現在這個遊戲裡 ——
// 聽不出差別的題目只會讓孩子猜，學不到東西。
export const VOICE_TONES = {
  happy:     { pitch: 1.55, rate: 1.15, volume: 1 },
  sad:       { pitch: 0.75, rate: 0.70, volume: 0.8 },
  angry:     { pitch: 0.85, rate: 1.40, volume: 1 },
  scared:    { pitch: 1.60, rate: 1.30, volume: 0.9 },
  surprised: { pitch: 1.80, rate: 1.25, volume: 1 },
  calm:      { pitch: 1.00, rate: 0.85, volume: 0.9 },
  tired:     { pitch: 0.70, rate: 0.60, volume: 0.7 },
  shy:       { pitch: 1.20, rate: 0.80, volume: 0.45 },
}

export const hasTone = (emotionId) => Boolean(VOICE_TONES[emotionId])

// 聽覺線索的說明，答對後告訴孩子「你是聽到什麼」
export const TONE_CLUE = {
  happy: '聲音比較高、比較快，像在跳。',
  sad: '聲音低低的、慢慢的，好像沒有力氣。',
  angry: '聲音又快又重，像在用力推。',
  scared: '聲音又高又急，有點抖。',
  surprised: '聲音突然變得很高。',
  calm: '聲音平平的、慢慢的，很穩。',
  tired: '聲音很低、拖得很長，像快睡著了。',
  shy: '聲音變得好小聲，慢慢的。',
}
