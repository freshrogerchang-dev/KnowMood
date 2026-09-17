// 「情緒在哪裡？」的資料
//
// 每個情緒兩件事：
//   body      —— 這個情緒在身體的哪裡、是什麼感覺（內感受 interoception）
//   reactions —— 有這個情緒的時候，身體會做出什麼動作
//
// 為什麼要教這個：ASD 孩子常常「感覺到了但不知道那是什麼」，
// 等到情緒已經很大才爆出來。先學會辨認身體訊號與自己的反應，
// 才有機會在情緒還小的時候就說出來。
//
// 動作刻意寫成看得到、做得出來的樣子（拍拍手、腳用力踩），
// 不寫抽象的心理狀態，孩子才對得起來。
// 每個動作在全部情緒裡都是獨一無二的，配對遊戲才不會出現兩個都對的情況。

export const EMOTION_BODY = {
  happy:     { where: '胸口', feel: '胸口暖暖的，身體輕輕的，好像坐不住。' },
  sad:       { where: '胸口 / 喉嚨', feel: '胸口悶悶的，喉嚨緊緊的，眼睛熱熱的。' },
  angry:     { where: '臉 / 手', feel: '臉熱熱的，拳頭會自己握緊，身體變得很用力。' },
  scared:    { where: '心臟 / 肚子', feel: '心跳變得好快，肚子涼涼的，手心會流汗。' },
  surprised: { where: '全身', feel: '像被電到一下，整個人會先停住。' },
  calm:      { where: '肩膀 / 呼吸', feel: '肩膀垮下來，呼吸慢慢的，身體鬆鬆的。' },
  shy:       { where: '臉', feel: '臉紅紅熱熱的，很想把自己縮小。' },
  tired:     { where: '眼皮 / 手腳', feel: '眼皮好重，手腳沒力氣，只想躺下來。' },
}

/** @type {Record<string, {icon:string, text:string}[]>} */
export const EMOTION_REACTIONS = {
  happy: [
    { icon: '👏', text: '拍拍手' },
    { icon: '🤸', text: '跳來跳去' },
    { icon: '🔊', text: '笑出聲音' },
    { icon: '🎁', text: '想跟大家分享' },
  ],
  sad: [
    { icon: '💧', text: '眼淚掉下來' },
    { icon: '🧸', text: '想找人抱抱' },
    { icon: '⬇️', text: '頭低低的' },
    { icon: '🛑', text: '什麼都不想做' },
  ],
  angry: [
    { icon: '✊', text: '握緊拳頭' },
    { icon: '📢', text: '大聲說話' },
    { icon: '👟', text: '腳用力踩' },
    { icon: '⚡', text: '想推開東西' },
  ],
  scared: [
    { icon: '〰️', text: '身體發抖' },
    { icon: '🚪', text: '想躲起來' },
    { icon: '🤝', text: '抓緊大人的手' },
    { icon: '💓', text: '心跳變好快' },
  ],
  surprised: [
    { icon: '👀', text: '眼睛睜得好大' },
    { icon: '⭕', text: '嘴巴張成圓形' },
    { icon: '💬', text: '「哇」地叫出來' },
    { icon: '⏸️', text: '整個人停住' },
  ],
  calm: [
    { icon: '🫧', text: '慢慢地呼吸' },
    { icon: '🪑', text: '坐得住' },
    { icon: '📖', text: '可以專心做事' },
    { icon: '🛋️', text: '身體鬆鬆的' },
  ],
  shy: [
    { icon: '🌸', text: '臉紅紅的' },
    { icon: '🔉', text: '聲音變小' },
    { icon: '👕', text: '摸摸自己的衣角' },
    { icon: '🔄', text: '把身體轉開' },
  ],
  tired: [
    { icon: '💤', text: '一直打呵欠' },
    { icon: '🌙', text: '眼皮變好重' },
    { icon: '🛏️', text: '想躺下來' },
    { icon: '🐢', text: '走路變慢' },
  ],
}

export const reactionsOf = (emotionId) => EMOTION_REACTIONS[emotionId] || []
export const bodyOf = (emotionId) => EMOTION_BODY[emotionId]

/** 反應文字 → 它屬於哪個情緒（答錯時用來說「這個比較像是生氣的時候」） */
export const REACTION_OWNER = Object.fromEntries(
  Object.entries(EMOTION_REACTIONS).flatMap(([id, list]) => list.map((r) => [r.text, id])),
)
