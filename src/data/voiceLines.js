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

// Web Speech 只有 pitch / rate / volume 三個旋鈕，能拉開的空間有限。
// 八種情緒硬塞進這兩個維度會有好幾組聽起來幾乎一樣（開心↔害怕、難過↔累了、
// 平靜↔難過…），那種題目孩子只能用猜的，學不到東西。
//
// 所以這個遊戲只收「聲音上真的分得出來」的六種。平靜與害羞沒有列進來 ——
// 它們的聲音特徵（慢、小聲）跟難過和累了重疊太多，連大人光聽都不容易分。
// hasTone() 會自動把它們排除在選項之外。
//
// 下面任兩組之間，pitch 或 rate 至少差 0.25（見 npm 測試的驗算）。
export const VOICE_TONES = {
  tired:     { pitch: 0.60, rate: 0.55, volume: 0.7 }, // 很低、很慢
  sad:       { pitch: 0.85, rate: 0.80, volume: 0.8 }, // 低、慢
  angry:     { pitch: 0.80, rate: 1.15, volume: 1 },   // 低但偏快 = 用力
  happy:     { pitch: 1.45, rate: 0.95, volume: 1 },   // 高、正常速度
  scared:    { pitch: 1.60, rate: 1.25, volume: 0.9 }, // 又高又急，但不誇張
  surprised: { pitch: 1.95, rate: 0.90, volume: 1 },   // 最高，速度正常
}

export const hasTone = (emotionId) => Boolean(VOICE_TONES[emotionId])

// 聽覺線索的說明，答對後告訴孩子「你是聽到什麼」
export const TONE_CLUE = {
  happy: '聲音比較高、比較快，像在跳。',
  sad: '聲音低低的、慢慢的，好像沒有力氣。',
  angry: '聲音低低的可是很快很用力，像在推東西。',
  scared: '聲音又高又急，像在趕時間。',
  surprised: '聲音一下子變得好高。',
  tired: '聲音很低、拖得很長，像快睡著了。',
}
