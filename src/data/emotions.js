// 情緒資料表
// level：解鎖階段。1 = 四種核心情緒（ASD 幼兒先從最容易辨識的開始），
//        2 = 加入中等難度，3 = 加入細緻情緒。家長可在設定頁調整。
// face：交給 <EmotionFace /> 組出 SVG 五官，不用表情符號 —— 同一套線條風格，
//        小朋友才不會因為各平台 emoji 長相不同而混淆。

export const EMOTIONS = [
  {
    id: 'happy',
    name: '開心',
    zhuyin: ['ㄎㄞ', 'ㄒㄧㄣ'],
    level: 1,
    color: '#F3C14F',
    tint: '#FDF3DB',
    face: { brow: 'happy', eye: 'arc', mouth: 'openSmile', blush: true },
    bodyClue: '嘴巴往上翹、眼睛彎彎的，身體想跳來跳去。',
    iSay: '我很開心！',
    cope: '可以跟旁邊的人說：「我好開心！」，或是一起擊掌。',
  },
  {
    id: 'sad',
    name: '難過',
    zhuyin: ['ㄋㄢˊ', 'ㄍㄨㄛˋ'],
    level: 1,
    color: '#7FA9D4',
    tint: '#E6EEF8',
    face: { brow: 'sad', eye: 'open', mouth: 'frown', tear: true },
    bodyClue: '嘴角往下、眼睛濕濕的，頭會低低的。',
    iSay: '我覺得難過。',
    cope: '可以找大人抱抱，或說：「我需要幫忙。」',
  },
  {
    id: 'angry',
    name: '生氣',
    zhuyin: ['ㄕㄥ', 'ㄑㄧˋ'],
    level: 1,
    color: '#E08A6E',
    tint: '#FAE7E0',
    face: { brow: 'angry', eye: 'narrow', mouth: 'wave', steam: true },
    bodyClue: '眉毛擠在一起、拳頭握緊，身體熱熱的。',
    iSay: '我在生氣。',
    cope: '先深呼吸三次，再說出：「我生氣，因為……」',
  },
  {
    id: 'scared',
    name: '害怕',
    zhuyin: ['ㄏㄞˋ', 'ㄆㄚˋ'],
    level: 1,
    color: '#A99BD4',
    tint: '#EDEAF7',
    face: { brow: 'scared', eye: 'wide', mouth: 'smallO', sweat: true },
    bodyClue: '眼睛睜得好大、身體會縮起來或發抖。',
    iSay: '我有點害怕。',
    cope: '牽住大人的手，慢慢吸氣、慢慢吐氣。',
  },
  {
    id: 'surprised',
    name: '驚訝',
    zhuyin: ['ㄐㄧㄥ', 'ㄧㄚˋ'],
    level: 2,
    color: '#6FC2C0',
    tint: '#DFF2F1',
    face: { brow: 'up', eye: 'wide', mouth: 'o' },
    bodyClue: '眉毛高高抬起、嘴巴張成圓圓的「喔」。',
    iSay: '哇！我好驚訝！',
    cope: '先停一下看清楚，再問：「發生什麼事了？」',
  },
  {
    id: 'calm',
    name: '平靜',
    zhuyin: ['ㄆㄧㄥˊ', 'ㄐㄧㄥˋ'],
    level: 2,
    color: '#93C08A',
    tint: '#E6F1E3',
    face: { brow: 'flat', eye: 'closed', mouth: 'slight' },
    bodyClue: '呼吸慢慢的、肩膀放鬆，身體舒服。',
    iSay: '我很平靜。',
    cope: '這是最舒服的感覺，可以繼續做喜歡的事。',
  },
  {
    id: 'shy',
    name: '害羞',
    zhuyin: ['ㄏㄞˋ', 'ㄒㄧㄡ'],
    level: 3,
    color: '#EDA5B6',
    tint: '#FBE8ED',
    face: { brow: 'flat', eye: 'down', mouth: 'slight', blush: true },
    bodyClue: '臉紅紅的、眼睛看地上，說話變小聲。',
    iSay: '我有一點害羞。',
    cope: '可以先小小聲說話，或請大人陪著一起。',
  },
  {
    id: 'tired',
    name: '累了',
    zhuyin: ['ㄌㄟˋ', '˙ㄌㄜ'],
    level: 3,
    color: '#B7AFA4',
    tint: '#EFEBE5',
    face: { brow: 'droop', eye: 'half', mouth: 'line', zzz: true },
    bodyClue: '眼皮重重的、一直打呵欠，不想動。',
    iSay: '我累了。',
    cope: '跟大人說：「我想休息一下。」然後去安靜的地方。',
  },
]

export const EMOTION_BY_ID = Object.fromEntries(EMOTIONS.map((e) => [e.id, e]))

export const getEmotion = (id) => EMOTION_BY_ID[id]

/** 依家長設定取出可以出現在遊戲中的情緒 */
export function activeEmotions(settings) {
  const level = settings?.level ?? 1
  const disabled = settings?.disabledEmotions ?? []
  const pool = EMOTIONS.filter((e) => e.level <= level && !disabled.includes(e.id))
  // 至少要有兩種才玩得起來，不足就回到第一階
  return pool.length >= 2 ? pool : EMOTIONS.filter((e) => e.level === 1)
}
