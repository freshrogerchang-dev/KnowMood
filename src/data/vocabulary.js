// 情緒詞彙家族
//
// 每個核心情緒底下掛一串「同一家族、不同強度」的詞。
// 目的是情緒細緻度（emotional granularity）—— 能用愈精準的詞描述感受，
// 情緒調節就愈容易。這對 ASD 孩子特別重要，但前提是「規則要講清楚」：
// 所以每個詞都標了 band（適合的 1-5 強度區間）和 when（什麼時候用這個詞）。
//
// 注意：這些詞「不會」進入配對／情境遊戲的選項。
// 遊戲維持 4-8 個核心情緒，選項才不會爆炸、才守得住無錯誤學習的設計。
// 詞彙只出現在「情緒圖鑑」和「今天的心情」裡，由大人陪著讀。

/** @typedef {{word:string, zhuyin:string[], band:[number,number], when:string}} EmotionWord */

/** @type {Record<string, EmotionWord[]>} */
export const EMOTION_WORDS = {
  happy: [
    { word: '舒服',   zhuyin: ['ㄕㄨ', '˙ㄈㄨ'],              band: [1, 2], when: '身體和心情都鬆鬆的，沒有不舒服的地方。' },
    { word: '滿足',   zhuyin: ['ㄇㄢˇ', 'ㄗㄨˊ'],             band: [2, 3], when: '想要的已經夠了，不用再多。' },
    { word: '高興',   zhuyin: ['ㄍㄠ', 'ㄒㄧㄥˋ'],            band: [3, 4], when: '有好事情發生的時候。' },
    { word: '得意',   zhuyin: ['ㄉㄜˊ', 'ㄧˋ'],               band: [3, 4], when: '自己做到很難的事，想給別人看。' },
    { word: '幸福',   zhuyin: ['ㄒㄧㄥˋ', 'ㄈㄨˊ'],           band: [3, 5], when: '被愛、被照顧，心裡暖暖的。' },
    { word: '興奮',   zhuyin: ['ㄒㄧㄥ', 'ㄈㄣˋ'],            band: [4, 5], when: '開心到身體停不下來，很想跳很想叫。' },
  ],
  sad: [
    { word: '失望',   zhuyin: ['ㄕ', 'ㄨㄤˋ'],                band: [2, 3], when: '本來很期待，結果沒有發生。' },
    { word: '寂寞',   zhuyin: ['ㄐㄧˋ', 'ㄇㄛˋ'],             band: [2, 4], when: '只有自己一個人，很想有人陪。' },
    { word: '委屈',   zhuyin: ['ㄨㄟˇ', 'ㄑㄩ'],              band: [3, 4], when: '明明不是我的錯，卻被說。' },
    { word: '傷心',   zhuyin: ['ㄕㄤ', 'ㄒㄧㄣ'],             band: [4, 5], when: '很重要的人或東西不見了。' },
    { word: '想哭',   zhuyin: ['ㄒㄧㄤˇ', 'ㄎㄨ'],            band: [4, 5], when: '難過到眼淚快要掉下來。' },
  ],
  angry: [
    { word: '不高興', zhuyin: ['ㄅㄨˋ', 'ㄍㄠ', 'ㄒㄧㄥˋ'],   band: [1, 2], when: '有一點點不喜歡，但還可以忍。' },
    { word: '煩躁',   zhuyin: ['ㄈㄢˊ', 'ㄗㄠˋ'],             band: [2, 3], when: '一直做不好，心裡毛毛的、坐不住。' },
    { word: '氣呼呼', zhuyin: ['ㄑㄧˋ', 'ㄏㄨ', 'ㄏㄨ'],      band: [3, 4], when: '生氣到臉鼓起來、呼吸變大聲。' },
    { word: '火大',   zhuyin: ['ㄏㄨㄛˇ', 'ㄉㄚˋ'],           band: [4, 5], when: '很生氣，身體整個熱起來。' },
    { word: '抓狂',   zhuyin: ['ㄓㄨㄚ', 'ㄎㄨㄤˊ'],          band: [5, 5], when: '氣到快要控制不住自己 —— 這時候要先離開現場深呼吸。' },
  ],
  scared: [
    { word: '緊張',   zhuyin: ['ㄐㄧㄣˇ', 'ㄓㄤ'],            band: [1, 3], when: '等一下要做沒做過的事，心跳變快。' },
    { word: '擔心',   zhuyin: ['ㄉㄢ', 'ㄒㄧㄣ'],             band: [2, 3], when: '一直想「如果變成那樣怎麼辦」。' },
    { word: '不安',   zhuyin: ['ㄅㄨˋ', 'ㄢ'],                band: [2, 3], when: '不知道接下來會發生什麼，怪怪的。' },
    { word: '好害怕', zhuyin: ['ㄏㄠˇ', 'ㄏㄞˋ', 'ㄆㄚˋ'],    band: [4, 5], when: '身體會發抖、想躲起來。' },
    { word: '嚇壞了', zhuyin: ['ㄒㄧㄚˋ', 'ㄏㄨㄞˋ', '˙ㄌㄜ'], band: [5, 5], when: '怕到動不了、說不出話。' },
  ],
  surprised: [
    { word: '好奇',       zhuyin: ['ㄏㄠˋ', 'ㄑㄧˊ'],                     band: [1, 3], when: '看到新的東西，很想知道那是什麼。' },
    { word: '意外',       zhuyin: ['ㄧˋ', 'ㄨㄞˋ'],                       band: [2, 3], when: '結果跟自己想的不一樣。' },
    { word: '嚇一跳',     zhuyin: ['ㄒㄧㄚˋ', 'ㄧˊ', 'ㄊㄧㄠˋ'],          band: [3, 4], when: '突然有聲音或東西出現。' },
    { word: '驚喜',       zhuyin: ['ㄐㄧㄥ', 'ㄒㄧˇ'],                     band: [4, 5], when: '沒想到的好事發生了，又驚訝又開心。' },
    { word: '不敢相信',   zhuyin: ['ㄅㄨˋ', 'ㄍㄢˇ', 'ㄒㄧㄤ', 'ㄒㄧㄣˋ'], band: [5, 5], when: '太驚訝了，要再看一次才確定。' },
  ],
  calm: [
    { word: '無聊',   zhuyin: ['ㄨˊ', 'ㄌㄧㄠˊ'],             band: [1, 2], when: '沒有事情做，有點空空的。' },
    { word: '還好',   zhuyin: ['ㄏㄞˊ', 'ㄏㄠˇ'],             band: [1, 2], when: '不特別好也不特別壞，普通。' },
    { word: '放鬆',   zhuyin: ['ㄈㄤˋ', 'ㄙㄨㄥ'],            band: [3, 4], when: '肩膀垮下來，呼吸慢慢的。' },
    { word: '安心',   zhuyin: ['ㄢ', 'ㄒㄧㄣ'],               band: [3, 4], when: '知道有人在旁邊，不用擔心。' },
    { word: '自在',   zhuyin: ['ㄗˋ', 'ㄗㄞˋ'],               band: [4, 5], when: '可以做自己，不用勉強。' },
  ],
  shy: [
    { word: '不好意思', zhuyin: ['ㄅㄨˋ', 'ㄏㄠˇ', 'ㄧˋ', '˙ㄙ'], band: [2, 3], when: '被稱讚或被注意的時候。' },
    { word: '怕生',     zhuyin: ['ㄆㄚˋ', 'ㄕㄥ'],                  band: [3, 4], when: '遇到不認識的人，想躲到大人後面。' },
    { word: '尷尬',     zhuyin: ['ㄍㄢ', 'ㄍㄚˋ'],                  band: [3, 4], when: '做錯事被看到，不知道要說什麼。' },
    { word: '臉紅',     zhuyin: ['ㄌㄧㄢˇ', 'ㄏㄨㄥˊ'],             band: [4, 5], when: '害羞到臉熱熱的、變紅色。' },
  ],
  tired: [
    { word: '懶懶的', zhuyin: ['ㄌㄢˇ', 'ㄌㄢˇ', '˙ㄉㄜ'],    band: [1, 2], when: '還可以動，但什麼都不太想做。' },
    { word: '有點累', zhuyin: ['ㄧㄡˇ', 'ㄉㄧㄢˇ', 'ㄌㄟˋ'],  band: [2, 3], when: '休息一下就會好。' },
    { word: '想睡',   zhuyin: ['ㄒㄧㄤˇ', 'ㄕㄨㄟˋ'],          band: [3, 4], when: '眼皮重重的，一直打呵欠。' },
    { word: '沒力氣', zhuyin: ['ㄇㄟˊ', 'ㄌㄧˋ', 'ㄑㄧˋ'],    band: [4, 5], when: '累到手腳都抬不起來。' },
  ],
}

/** 某個情緒的所有延伸詞（由弱到強） */
export const wordsOf = (emotionId) => EMOTION_WORDS[emotionId] || []

/** 挑出適合這個強度的詞，用來在心情日記裡提示更精準的說法 */
export function wordsForIntensity(emotionId, intensity) {
  const all = wordsOf(emotionId)
  const hit = all.filter((w) => intensity >= w.band[0] && intensity <= w.band[1])
  if (hit.length) return hit
  // 這個強度剛好沒有對應的詞時，退而取最接近的一個，不要留空白
  return all.length
    ? [all.reduce((best, w) => {
        const d = (x) => Math.min(Math.abs(intensity - x.band[0]), Math.abs(intensity - x.band[1]))
        return d(w) < d(best) ? w : best
      })]
    : []
}

export const totalWordCount = Object.values(EMOTION_WORDS).reduce((n, list) => n + list.length, 0)
